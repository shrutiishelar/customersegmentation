package com.customersegmentation.controller;

import com.customersegmentation.dto.UploadSummaryResponse;
import com.customersegmentation.service.DatasetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/dataset")
public class DatasetController {

    private final DatasetService datasetService;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadSummaryResponse> uploadCsv(@RequestParam("file") MultipartFile file) {
        UploadSummaryResponse summary = datasetService.processCsvUpload(file);
        return ResponseEntity.ok(summary);
    }
}

