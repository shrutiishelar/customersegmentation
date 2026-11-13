package com.customersegmentation.spark.service;

import com.customersegmentation.spark.config.SparkSessionFactory;
import com.customersegmentation.spark.model.ClusterSummary;
import com.customersegmentation.spark.model.CustomerRecord;
import com.customersegmentation.spark.model.ElbowPoint;
import com.customersegmentation.spark.model.SegmentationResult;
import org.apache.spark.ml.clustering.KMeans;
import org.apache.spark.ml.clustering.KMeansModel;
import org.apache.spark.ml.evaluation.ClusteringEvaluator;
import org.apache.spark.ml.feature.StandardScaler;
import org.apache.spark.ml.feature.StandardScalerModel;
import org.apache.spark.ml.feature.VectorAssembler;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

public class SparkKMeansEngine implements Serializable {

    private static final long serialVersionUID = 1L;

    private static final String[] CLUSTER_PALETTE = {
            "#8b5cf6", // Purple
            "#3b82f6", // Blue
            "#10b981", // Emerald
            "#f59e0b", // Amber
            "#ec4899", // Pink
            "#06b6d4", // Cyan
            "#84cc16", // Lime
            "#a855f7"  // Violet
    };

    /**
     * Executes Spark MLlib K-Means clustering pipeline on customer feature records.
     */
    public SegmentationResult runSegmentation(List<CustomerRecord> records, int k, int maxIterations) {
        validateInputs(records, k, maxIterations);

        long startTime = System.currentTimeMillis();
        SparkSession spark = SparkSessionFactory.getInstance();

        // 1. Create DataFrame from Java POJO records
        Dataset<Row> rawDf = spark.createDataFrame(records, CustomerRecord.class);

        // 2. VectorAssembler: assemble numerical features (Age, AnnualIncome, SpendingScore)
        // Strictly excluding customerId from the feature vector!
        VectorAssembler assembler = new VectorAssembler()
                .setInputCols(new String[]{"age", "annualIncome", "spendingScore"})
                .setOutputCol("rawFeatures");
        Dataset<Row> assembledDf = assembler.transform(rawDf);

        // 3. Feature Scaling: StandardScaler with std and mean centering
        StandardScaler scaler = new StandardScaler()
                .setInputCol("rawFeatures")
                .setOutputCol("features")
                .setWithStd(true)
                .setWithMean(true);
        StandardScalerModel scalerModel = scaler.fit(assembledDf);
        Dataset<Row> scaledDf = scalerModel.transform(assembledDf);

        // 4. K-Means clustering model training
        KMeans kmeans = new KMeans()
                .setK(k)
                .setMaxIter(maxIterations)
                .setSeed(42L)
                .setFeaturesCol("features")
                .setPredictionCol("prediction");
        KMeansModel model = kmeans.fit(scaledDf);

        // 5. Predict cluster label for each customer
        Dataset<Row> predictions = model.transform(scaledDf);

        // 6. Inertia metric: Within-Cluster Sum of Squares (WCSS / trainingCost)
        double wcss = model.summary().trainingCost();

        // 7. Silhouette score evaluation
        ClusteringEvaluator evaluator = new ClusteringEvaluator()
                .setFeaturesCol("features")
                .setPredictionCol("prediction")
                .setMetricName("silhouette")
                .setDistanceMeasure("squaredEuclidean");
        double silhouette = evaluator.evaluate(predictions);

        // 8. Extract customer predictions and collect aggregated cluster statistics
        List<Row> rows = predictions.select("customerId", "prediction", "age", "annualIncome", "spendingScore").collectAsList();

        Map<String, Integer> customerAssignments = new LinkedHashMap<>();
        Map<Integer, List<Row>> clusterGroups = new HashMap<>();

        for (Row row : rows) {
            String customerId = row.getString(0);
            int clusterId = row.getInt(1);
            customerAssignments.put(customerId, clusterId);
            clusterGroups.computeIfAbsent(clusterId, c -> new ArrayList<>()).add(row);
        }

        List<ClusterSummary> summaries = new ArrayList<>();
        for (int cId = 0; cId < k; cId++) {
            List<Row> clusterRows = clusterGroups.getOrDefault(cId, Collections.emptyList());
            int count = clusterRows.size();

            double avgAge = 0.0;
            double avgIncome = 0.0;
            double avgSpending = 0.0;

            if (count > 0) {
                avgAge = clusterRows.stream().mapToDouble(r -> r.getDouble(2)).average().orElse(0.0);
                avgIncome = clusterRows.stream().mapToDouble(r -> r.getDouble(3)).average().orElse(0.0);
                avgSpending = clusterRows.stream().mapToDouble(r -> r.getDouble(4)).average().orElse(0.0);
            }

            String color = CLUSTER_PALETTE[cId % CLUSTER_PALETTE.length];
            String personaName = assignPersonaName(avgIncome, avgSpending);

            ClusterSummary summary = new ClusterSummary(
                    cId,
                    personaName,
                    count,
                    round(avgAge, 1),
                    round(avgIncome, 1),
                    round(avgSpending, 1),
                    round(avgIncome, 1),
                    round(avgSpending, 1),
                    color
            );
            summaries.add(summary);
        }

        long executionTimeMs = System.currentTimeMillis() - startTime;

        return new SegmentationResult(
                k,
                maxIterations,
                round(wcss, 2),
                round(silhouette, 4),
                executionTimeMs,
                summaries,
                customerAssignments,
                spark.version()
        );
    }

    /**
     * Evaluates the Elbow Curve for K in [minK, maxK]
     */
    public List<ElbowPoint> computeElbowCurve(List<CustomerRecord> records, int minK, int maxK, int maxIterations) {
        if (records == null || records.isEmpty()) {
            throw new IllegalArgumentException("Dataset cannot be empty for Elbow method evaluation.");
        }
        if (minK < 2) minK = 2;
        if (maxK > 8) maxK = 8;
        if (minK > maxK) minK = maxK;

        SparkSession spark = SparkSessionFactory.getInstance();
        Dataset<Row> rawDf = spark.createDataFrame(records, CustomerRecord.class);

        VectorAssembler assembler = new VectorAssembler()
                .setInputCols(new String[]{"age", "annualIncome", "spendingScore"})
                .setOutputCol("rawFeatures");
        Dataset<Row> assembledDf = assembler.transform(rawDf);

        StandardScaler scaler = new StandardScaler()
                .setInputCol("rawFeatures")
                .setOutputCol("features")
                .setWithStd(true)
                .setWithMean(true);
        StandardScalerModel scalerModel = scaler.fit(assembledDf);
        Dataset<Row> scaledDf = scalerModel.transform(assembledDf);

        ClusteringEvaluator evaluator = new ClusteringEvaluator()
                .setFeaturesCol("features")
                .setPredictionCol("prediction")
                .setMetricName("silhouette")
                .setDistanceMeasure("squaredEuclidean");

        List<ElbowPoint> points = new ArrayList<>();
        for (int currentK = minK; currentK <= maxK; currentK++) {
            KMeans kmeans = new KMeans()
                    .setK(currentK)
                    .setMaxIter(maxIterations)
                    .setSeed(42L)
                    .setFeaturesCol("features")
                    .setPredictionCol("prediction");
            KMeansModel model = kmeans.fit(scaledDf);
            Dataset<Row> preds = model.transform(scaledDf);

            double wcss = model.summary().trainingCost();
            double silhouette = evaluator.evaluate(preds);

            points.add(new ElbowPoint(currentK, round(wcss, 2), round(silhouette, 4)));
        }

        return points;
    }

    private void validateInputs(List<CustomerRecord> records, int k, int maxIterations) {
        if (records == null || records.isEmpty()) {
            throw new IllegalArgumentException("Customer records cannot be empty for Spark K-Means clustering.");
        }
        if (records.size() < k) {
            throw new IllegalArgumentException(String.format("Dataset size (%d) must be greater than or equal to K (%d).", records.size(), k));
        }
        if (k < 2 || k > 8) {
            throw new IllegalArgumentException("K must be between 2 and 8.");
        }
        if (maxIterations < 5 || maxIterations > 100) {
            throw new IllegalArgumentException("Maximum iterations must be between 5 and 100.");
        }
    }

    private String assignPersonaName(double income, double spending) {
        if (income >= 70 && spending >= 65) {
            return "Target Elite / VIPs";
        } else if (income >= 70 && spending < 45) {
            return "Sensible Savers";
        } else if (income < 45 && spending >= 65) {
            return "Eager Spenders";
        } else if (income < 45 && spending < 45) {
            return "Careful Budgeters";
        } else {
            return "Balanced Standard";
        }
    }

    private double round(double value, int places) {
        if (Double.isNaN(value) || Double.isInfinite(value)) return 0.0;
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}

