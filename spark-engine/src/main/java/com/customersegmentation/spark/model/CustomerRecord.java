package com.customersegmentation.spark.model;

import java.io.Serializable;

/**
 * POJO representing customer features for Spark MLlib.
 * Note: customerId is retained as an identifier, but is strictly EXCLUDED
 * from ML feature vectors.
 */
public class CustomerRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    private String customerId;
    private Double age;
    private Double annualIncome;
    private Double spendingScore;

    public CustomerRecord() {}

    public CustomerRecord(String customerId, Double age, Double annualIncome, Double spendingScore) {
        this.customerId = customerId;
        this.age = age;
        this.annualIncome = annualIncome;
        this.spendingScore = spendingScore;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public Double getAge() {
        return age;
    }

    public void setAge(Double age) {
        this.age = age;
    }

    public Double getAnnualIncome() {
        return annualIncome;
    }

    public void setAnnualIncome(Double annualIncome) {
        this.annualIncome = annualIncome;
    }

    public Double getSpendingScore() {
        return spendingScore;
    }

    public void setSpendingScore(Double spendingScore) {
        this.spendingScore = spendingScore;
    }

    @Override
    public String toString() {
        return "CustomerRecord{" +
                "customerId='" + customerId + '\'' +
                ", age=" + age +
                ", annualIncome=" + annualIncome +
                ", spendingScore=" + spendingScore +
                '}';
    }
}

