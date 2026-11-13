package com.customersegmentation.dto;

import java.util.Map;

public class DashboardSummaryResponse {

    private long totalCustomers;
    private int totalClusters;
    private double avgAnnualIncome;
    private double avgSpendingScore;
    private double avgAge;
    private Map<String, Long> clusterDistribution;
    private boolean isLiveDatabase;

    public DashboardSummaryResponse() {}

    public DashboardSummaryResponse(long totalCustomers, int totalClusters, double avgAnnualIncome, double avgSpendingScore, double avgAge, Map<String, Long> clusterDistribution, boolean isLiveDatabase) {
        this.totalCustomers = totalCustomers;
        this.totalClusters = totalClusters;
        this.avgAnnualIncome = avgAnnualIncome;
        this.avgSpendingScore = avgSpendingScore;
        this.avgAge = avgAge;
        this.clusterDistribution = clusterDistribution;
        this.isLiveDatabase = isLiveDatabase;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public int getTotalClusters() {
        return totalClusters;
    }

    public void setTotalClusters(int totalClusters) {
        this.totalClusters = totalClusters;
    }

    public double getAvgAnnualIncome() {
        return avgAnnualIncome;
    }

    public void setAvgAnnualIncome(double avgAnnualIncome) {
        this.avgAnnualIncome = avgAnnualIncome;
    }

    public double getAvgSpendingScore() {
        return avgSpendingScore;
    }

    public void setAvgSpendingScore(double avgSpendingScore) {
        this.avgSpendingScore = avgSpendingScore;
    }

    public double getAvgAge() {
        return avgAge;
    }

    public void setAvgAge(double avgAge) {
        this.avgAge = avgAge;
    }

    public Map<String, Long> getClusterDistribution() {
        return clusterDistribution;
    }

    public void setClusterDistribution(Map<String, Long> clusterDistribution) {
        this.clusterDistribution = clusterDistribution;
    }

    public boolean isLiveDatabase() {
        return isLiveDatabase;
    }

    public void setLiveDatabase(boolean liveDatabase) {
        isLiveDatabase = liveDatabase;
    }
}

