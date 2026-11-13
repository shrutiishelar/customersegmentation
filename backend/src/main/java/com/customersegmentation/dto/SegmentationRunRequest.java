package com.customersegmentation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class SegmentationRunRequest {

    @NotNull(message = "K value is required")
    @Min(value = 2, message = "K must be at least 2")
    @Max(value = 8, message = "K cannot exceed 8")
    private Integer k = 5;

    @NotNull(message = "Max iterations is required")
    @Min(value = 5, message = "Max iterations must be at least 5")
    @Max(value = 100, message = "Max iterations cannot exceed 100")
    private Integer maxIterations = 20;

    public SegmentationRunRequest() {}

    public SegmentationRunRequest(Integer k, Integer maxIterations) {
        this.k = k;
        this.maxIterations = maxIterations;
    }

    public Integer getK() {
        return k;
    }

    public void setK(Integer k) {
        this.k = k;
    }

    public Integer getMaxIterations() {
        return maxIterations;
    }

    public void setMaxIterations(Integer maxIterations) {
        this.maxIterations = maxIterations;
    }
}

