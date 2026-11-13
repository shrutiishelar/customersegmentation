package com.customersegmentation.spark.model;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class SegmentationResult implements Serializable {

    private static final long serialVersionUID = 1L;

    private int k;
    private int maxIterations;
    private double wcss;
    private double silhouetteScore;
    private long executionTimeMs;
    private List<ClusterSummary> clusterSummaries;
    private Map<String, Integer> customerClusterAssignments;
    private String sparkVersion;

    public SegmentationResult() {}

    public SegmentationResult(int k, int maxIterations, double wcss, double silhouetteScore, long executionTimeMs, List<ClusterSummary> clusterSummaries, Map<String, Integer> customerClusterAssignments, String sparkVersion) {
        this.k = k;
        this.maxIterations = maxIterations;
        this.wcss = wcss;
        this.silhouetteScore = silhouetteScore;
        this.executionTimeMs = executionTimeMs;
        this.clusterSummaries = clusterSummaries;
        this.customerClusterAssignments = customerClusterAssignments;
        this.sparkVersion = sparkVersion;
    }

    public int getK() {
        return k;
    }

    public void setK(int k) {
        this.k = k;
    }

    public int getMaxIterations() {
        return maxIterations;
    }

    public void setMaxIterations(int maxIterations) {
        this.maxIterations = maxIterations;
    }

    public double getWcss() {
        return wcss;
    }

    public void setWcss(double wcss) {
        this.wcss = wcss;
    }

    public double getSilhouetteScore() {
        return silhouetteScore;
    }

    public void setSilhouetteScore(double silhouetteScore) {
        this.silhouetteScore = silhouetteScore;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public List<ClusterSummary> getClusterSummaries() {
        return clusterSummaries;
    }

    public void setClusterSummaries(List<ClusterSummary> clusterSummaries) {
        this.clusterSummaries = clusterSummaries;
    }

    public Map<String, Integer> getCustomerClusterAssignments() {
        return customerClusterAssignments;
    }

    public void setCustomerClusterAssignments(Map<String, Integer> customerClusterAssignments) {
        this.customerClusterAssignments = customerClusterAssignments;
    }

    public String getSparkVersion() {
        return sparkVersion;
    }

    public void setSparkVersion(String sparkVersion) {
        this.sparkVersion = sparkVersion;
    }
}

