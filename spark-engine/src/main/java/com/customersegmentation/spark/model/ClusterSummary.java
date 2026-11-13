package com.customersegmentation.spark.model;

import java.io.Serializable;

public class ClusterSummary implements Serializable {

    private static final long serialVersionUID = 1L;

    private int clusterId;
    private String name;
    private int customerCount;
    private double avgAge;
    private double avgAnnualIncome;
    private double avgSpendingScore;
    private double centroidIncome;
    private double centroidSpending;
    private String color;

    public ClusterSummary() {}

    public ClusterSummary(int clusterId, String name, int customerCount, double avgAge, double avgAnnualIncome, double avgSpendingScore, double centroidIncome, double centroidSpending, String color) {
        this.clusterId = clusterId;
        this.name = name;
        this.customerCount = customerCount;
        this.avgAge = avgAge;
        this.avgAnnualIncome = avgAnnualIncome;
        this.avgSpendingScore = avgSpendingScore;
        this.centroidIncome = centroidIncome;
        this.centroidSpending = centroidSpending;
        this.color = color;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCustomerCount() {
        return customerCount;
    }

    public void setCustomerCount(int customerCount) {
        this.customerCount = customerCount;
    }

    public double getAvgAge() {
        return avgAge;
    }

    public void setAvgAge(double avgAge) {
        this.avgAge = avgAge;
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

    public double getCentroidIncome() {
        return centroidIncome;
    }

    public void setCentroidIncome(double centroidIncome) {
        this.centroidIncome = centroidIncome;
    }

    public double getCentroidSpending() {
        return centroidSpending;
    }

    public void setCentroidSpending(double centroidSpending) {
        this.centroidSpending = centroidSpending;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}

