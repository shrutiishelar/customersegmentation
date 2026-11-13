package com.customersegmentation.controller;

import com.customersegmentation.dto.SegmentationRunRequest;
import com.customersegmentation.service.SegmentationService;
import com.customersegmentation.spark.model.ElbowPoint;
import com.customersegmentation.spark.model.SegmentationResult;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/segmentation")
public class SegmentationController {

    private final SegmentationService segmentationService;

    public SegmentationController(SegmentationService segmentationService) {
        this.segmentationService = segmentationService;
    }

    @PostMapping("/run")
    public ResponseEntity<SegmentationResult> runSegmentation(@Valid @RequestBody(required = false) SegmentationRunRequest request) {
        int k = (request != null && request.getK() != null) ? request.getK() : 5;
        int maxIter = (request != null && request.getMaxIterations() != null) ? request.getMaxIterations() : 20;

        SegmentationResult result = segmentationService.runSegmentation(k, maxIter);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = segmentationService.getStatus();
        return ResponseEntity.ok(status);
    }

    @GetMapping("/results")
    public ResponseEntity<SegmentationResult> getResults() {
        SegmentationResult result = segmentationService.getLastResult();
        if (result == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/elbow")
    public ResponseEntity<List<ElbowPoint>> getElbowCurve(
            @RequestParam(defaultValue = "2") int minK,
            @RequestParam(defaultValue = "8") int maxK,
            @RequestParam(defaultValue = "20") int maxIterations) {
        List<ElbowPoint> points = segmentationService.getElbowCurve(minK, maxK, maxIterations);
        return ResponseEntity.ok(points);
    }
}

