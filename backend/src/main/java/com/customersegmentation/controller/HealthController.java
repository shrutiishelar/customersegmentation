package com.customersegmentation.controller;

import com.customersegmentation.dto.HealthResponse;
import com.customersegmentation.repository.CustomerRepository;
import com.customersegmentation.service.SegmentationService;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final MongoTemplate mongoTemplate;
    private final CustomerRepository customerRepository;
    private final SegmentationService segmentationService;

    public HealthController(MongoTemplate mongoTemplate,
                            CustomerRepository customerRepository,
                            SegmentationService segmentationService) {
        this.mongoTemplate = mongoTemplate;
        this.customerRepository = customerRepository;
        this.segmentationService = segmentationService;
    }

    @GetMapping({"/health", "/system/status"})
    public ResponseEntity<HealthResponse> getHealth() {
        boolean mongoConnected = false;
        String details;
        long count = 0;
        String dbName = "unknown";
        boolean sparkConnected = segmentationService.isSparkConnected();

        try {
            dbName = mongoTemplate.getDb().getName();
            Document pingResult = mongoTemplate.getDb().runCommand(new Document("ping", 1));
            Object okVal = pingResult.get("ok");
            mongoConnected = (okVal instanceof Number && ((Number) okVal).intValue() == 1);

            if (mongoConnected) {
                count = customerRepository.count();
                String sparkStatusMsg = sparkConnected 
                        ? "Apache Spark 4.0 MLlib K-Means active (Cluster model trained)." 
                        : "Apache Spark 4.0 engine ready in local mode (No job executed yet).";
                details = String.format("Connected to MongoDB [%s]. Customers: %d. %s", dbName, count, sparkStatusMsg);
            } else {
                details = "MongoDB ping command returned unready status: " + pingResult.toJson();
            }
        } catch (Exception ex) {
            mongoConnected = false;
            details = "MongoDB connection failed or unavailable: " + ex.getMessage();
        }

        HealthResponse response = new HealthResponse(
                mongoConnected ? "UP" : "DOWN",
                true, // Spring Boot REST API is running and responded
                mongoConnected,
                sparkConnected,
                dbName,
                count,
                details
        );

        HttpStatus status = mongoConnected ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return new ResponseEntity<>(response, status);
    }
}
