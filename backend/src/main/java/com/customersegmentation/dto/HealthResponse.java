package com.customersegmentation.dto;

import java.time.LocalDateTime;

public class HealthResponse {

    private String status;
    private boolean apiConnected;
    private boolean mongoConnected;
    private boolean sparkConnected;
    private String databaseName;
    private long totalCustomers;
    private LocalDateTime timestamp;
    private String details;

    public HealthResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public HealthResponse(String status, boolean apiConnected, boolean mongoConnected, boolean sparkConnected, String databaseName, long totalCustomers, String details) {
        this.status = status;
        this.apiConnected = apiConnected;
        this.mongoConnected = mongoConnected;
        this.sparkConnected = sparkConnected;
        this.databaseName = databaseName;
        this.totalCustomers = totalCustomers;
        this.timestamp = LocalDateTime.now();
        this.details = details;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isApiConnected() {
        return apiConnected;
    }

    public void setApiConnected(boolean apiConnected) {
        this.apiConnected = apiConnected;
    }

    public boolean isMongoConnected() {
        return mongoConnected;
    }

    public void setMongoConnected(boolean mongoConnected) {
        this.mongoConnected = mongoConnected;
    }

    public boolean isSparkConnected() {
        return sparkConnected;
    }

    public void setSparkConnected(boolean sparkConnected) {
        this.sparkConnected = sparkConnected;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}

