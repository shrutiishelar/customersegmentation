package com.customersegmentation.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "customers")
public class Customer {

    @Id
    private String id;

    @Indexed(unique = true)
    private String customerId;

    private String gender;

    private Integer age;

    private Double annualIncome;

    private Integer spendingScore;

    private Integer cluster; // Nullable until Spark K-Means clustering runs

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Customer() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Customer(String customerId, String gender, Integer age, Double annualIncome, Integer spendingScore, Integer cluster) {
        this.customerId = customerId;
        this.gender = gender;
        this.age = age;
        this.annualIncome = annualIncome;
        this.spendingScore = spendingScore;
        this.cluster = cluster;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Double getAnnualIncome() {
        return annualIncome;
    }

    public void setAnnualIncome(Double annualIncome) {
        this.annualIncome = annualIncome;
    }

    public Integer getSpendingScore() {
        return spendingScore;
    }

    public void setSpendingScore(Integer spendingScore) {
        this.spendingScore = spendingScore;
    }

    public Integer getCluster() {
        return cluster;
    }

    public void setCluster(Integer cluster) {
        this.cluster = cluster;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

