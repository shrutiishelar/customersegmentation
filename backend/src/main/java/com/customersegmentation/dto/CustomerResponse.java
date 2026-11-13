package com.customersegmentation.dto;

import com.customersegmentation.model.Customer;

import java.time.LocalDateTime;

public class CustomerResponse {

    private String id;
    private String customerId;
    private String gender;
    private Integer age;
    private Double annualIncome;
    private Integer spendingScore;
    private Integer cluster;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CustomerResponse() {}

    public CustomerResponse(Customer customer) {
        if (customer != null) {
            this.id = customer.getId();
            this.customerId = customer.getCustomerId();
            this.gender = customer.getGender();
            this.age = customer.getAge();
            this.annualIncome = customer.getAnnualIncome();
            this.spendingScore = customer.getSpendingScore();
            this.cluster = customer.getCluster();
            this.createdAt = customer.getCreatedAt();
            this.updatedAt = customer.getUpdatedAt();
        }
    }

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

