package com.customersegmentation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class CustomerRequest {

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(?i)(Male|Female|Other)$", message = "Gender must be Male, Female, or Other")
    private String gender;

    @NotNull(message = "Age is required")
    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 120, message = "Age cannot exceed 120")
    private Integer age;

    @NotNull(message = "Annual income is required")
    @DecimalMin(value = "0.0", message = "Annual income cannot be negative")
    private Double annualIncome;

    @NotNull(message = "Spending score is required")
    @Min(value = 1, message = "Spending score must be between 1 and 100")
    @Max(value = 100, message = "Spending score must be between 1 and 100")
    private Integer spendingScore;

    private Integer cluster;

    public CustomerRequest() {}

    public CustomerRequest(String customerId, String gender, Integer age, Double annualIncome, Integer spendingScore, Integer cluster) {
        this.customerId = customerId;
        this.gender = gender;
        this.age = age;
        this.annualIncome = annualIncome;
        this.spendingScore = spendingScore;
        this.cluster = cluster;
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
}

