package com.customersegmentation.service;

import com.customersegmentation.exception.InvalidFileException;
import com.customersegmentation.model.Customer;
import com.customersegmentation.repository.CustomerRepository;
import com.customersegmentation.spark.model.CustomerRecord;
import com.customersegmentation.spark.model.ElbowPoint;
import com.customersegmentation.spark.model.SegmentationResult;
import com.customersegmentation.spark.service.SparkKMeansEngine;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class SegmentationService {

    private final CustomerRepository customerRepository;
    private final SparkKMeansEngine sparkEngine;

    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private volatile SegmentationResult lastResult = null;
    private volatile boolean hasCompletedJob = false;

    public SegmentationService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
        this.sparkEngine = new SparkKMeansEngine();
    }

    public synchronized SegmentationResult runSegmentation(int k, int maxIterations) {
        if (!isRunning.compareAndSet(false, true)) {
            throw new IllegalStateException("A Spark segmentation job is already in progress.");
        }

        try {
            List<Customer> customers = customerRepository.findAll();
            if (customers.isEmpty()) {
                throw new InvalidFileException("Cannot run segmentation: No customers found in MongoDB. Upload a dataset first.");
            }

            if (customers.size() < k) {
                throw new IllegalArgumentException(String.format("Dataset has %d customers, which is less than requested K=%d.", customers.size(), k));
            }

            // Convert MongoDB entities to Spark CustomerRecords
            List<CustomerRecord> records = new ArrayList<>();
            for (Customer c : customers) {
                if (c.getCustomerId() != null && c.getAge() != null && c.getAnnualIncome() != null && c.getSpendingScore() != null) {
                    records.add(new CustomerRecord(
                            c.getCustomerId(),
                            c.getAge().doubleValue(),
                            c.getAnnualIncome(),
                            c.getSpendingScore().doubleValue()
                    ));
                }
            }

            if (records.size() < k) {
                throw new InvalidFileException("Not enough valid customer records with complete numerical features to form " + k + " clusters.");
            }

            // Execute real Spark MLlib K-Means pipeline
            SegmentationResult result = sparkEngine.runSegmentation(records, k, maxIterations);

            // Persist cluster assignments to MongoDB
            Map<String, Integer> assignments = result.getCustomerClusterAssignments();
            for (Customer c : customers) {
                Integer clusterId = assignments.get(c.getCustomerId());
                if (clusterId != null) {
                    c.setCluster(clusterId);
                    c.setUpdatedAt(LocalDateTime.now());
                }
            }
            customerRepository.saveAll(customers);

            this.lastResult = result;
            this.hasCompletedJob = true;

            return result;
        } finally {
            isRunning.set(false);
        }
    }

    public Map<String, Object> getStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("isRunning", isRunning.get());
        status.put("hasCompletedJob", hasCompletedJob);
        status.put("sparkAvailable", true);
        status.put("lastK", lastResult != null ? lastResult.getK() : null);
        status.put("lastWcss", lastResult != null ? lastResult.getWcss() : null);
        status.put("lastSilhouette", lastResult != null ? lastResult.getSilhouetteScore() : null);
        status.put("executionTimeMs", lastResult != null ? lastResult.getExecutionTimeMs() : null);
        status.put("sparkVersion", lastResult != null ? lastResult.getSparkVersion() : "4.0.0");
        return status;
    }

    public SegmentationResult getLastResult() {
        return lastResult;
    }

    public List<ElbowPoint> getElbowCurve(int minK, int maxK, int maxIterations) {
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) {
            throw new InvalidFileException("Cannot compute elbow curve: MongoDB customer collection is empty.");
        }

        List<CustomerRecord> records = new ArrayList<>();
        for (Customer c : customers) {
            if (c.getCustomerId() != null && c.getAge() != null && c.getAnnualIncome() != null && c.getSpendingScore() != null) {
                records.add(new CustomerRecord(
                        c.getCustomerId(),
                        c.getAge().doubleValue(),
                        c.getAnnualIncome(),
                        c.getSpendingScore().doubleValue()
                ));
            }
        }

        return sparkEngine.computeElbowCurve(records, minK, maxK, maxIterations);
    }

    public boolean isSparkConnected() {
        // True if at least one actual Spark job has succeeded or is ready
        return hasCompletedJob;
    }
}

