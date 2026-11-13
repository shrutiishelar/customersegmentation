package com.customersegmentation.controller;

import com.customersegmentation.dto.DashboardSummaryResponse;
import com.customersegmentation.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(summary);
    }
}

