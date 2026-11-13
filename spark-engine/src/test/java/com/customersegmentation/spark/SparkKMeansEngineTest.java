package com.customersegmentation.spark;

import com.customersegmentation.spark.model.CustomerRecord;
import com.customersegmentation.spark.model.ElbowPoint;
import com.customersegmentation.spark.model.SegmentationResult;
import com.customersegmentation.spark.service.SparkKMeansEngine;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SparkKMeansEngineTest {

    private static SparkKMeansEngine engine;
    private static List<CustomerRecord> sampleRecords;

    @BeforeAll
    static void init() {
        engine = new SparkKMeansEngine();
        sampleRecords = new ArrayList<>();

        // Generate synthetic clusters:
        // Cluster A: Low income, low spending
        sampleRecords.add(new CustomerRecord("C1", 20.0, 15.0, 20.0));
        sampleRecords.add(new CustomerRecord("C2", 22.0, 18.0, 25.0));
        sampleRecords.add(new CustomerRecord("C3", 25.0, 16.0, 19.0));

        // Cluster B: High income, high spending
        sampleRecords.add(new CustomerRecord("C4", 35.0, 85.0, 80.0));
        sampleRecords.add(new CustomerRecord("C5", 32.0, 90.0, 85.0));
        sampleRecords.add(new CustomerRecord("C6", 30.0, 95.0, 90.0));

        // Cluster C: High income, low spending
        sampleRecords.add(new CustomerRecord("C7", 45.0, 85.0, 15.0));
        sampleRecords.add(new CustomerRecord("C8", 50.0, 90.0, 18.0));
        sampleRecords.add(new CustomerRecord("C9", 48.0, 88.0, 12.0));
    }

    @Test
    void testInvalidKThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> engine.runSegmentation(sampleRecords, 1, 20));
        assertThrows(IllegalArgumentException.class, () -> engine.runSegmentation(sampleRecords, 10, 20));
    }

    @Test
    void testEmptyDatasetThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> engine.runSegmentation(new ArrayList<>(), 3, 20));
    }

    @Test
    void testSuccessfulSparkKMeansExecution() {
        SegmentationResult result = engine.runSegmentation(sampleRecords, 3, 20);

        assertNotNull(result);
        assertEquals(3, result.getK());
        assertEquals(20, result.getMaxIterations());
        assertTrue(result.getWcss() >= 0);
        assertEquals(9, result.getCustomerClusterAssignments().size());
        assertEquals(3, result.getClusterSummaries().size());

        // Verify customerId was mapped correctly to cluster [0, 2]
        for (String customerId : result.getCustomerClusterAssignments().keySet()) {
            int clusterId = result.getCustomerClusterAssignments().get(customerId);
            assertTrue(clusterId >= 0 && clusterId < 3);
        }
    }

    @Test
    void testElbowCurveComputation() {
        List<ElbowPoint> points = engine.computeElbowCurve(sampleRecords, 2, 4, 15);

        assertNotNull(points);
        assertEquals(3, points.size()); // k=2, 3, 4
        assertEquals(2, points.get(0).getK());
        assertEquals(3, points.get(1).getK());
        assertEquals(4, points.get(2).getK());

        // WCSS should decrease as K increases
        assertTrue(points.get(0).getWcss() >= points.get(1).getWcss());
    }
}

