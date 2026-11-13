package com.customersegmentation;

import com.customersegmentation.dto.UploadSummaryResponse;
import com.customersegmentation.exception.InvalidFileException;
import com.customersegmentation.model.Customer;
import com.customersegmentation.repository.CustomerRepository;
import com.customersegmentation.service.DatasetService;
import com.customersegmentation.service.SegmentationService;
import com.customersegmentation.spark.model.ElbowPoint;
import com.customersegmentation.spark.model.SegmentationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CustomerSegmentationApplicationTests {

    @Autowired
    private DatasetService datasetService;

    @Autowired
    private SegmentationService segmentationService;

    @Autowired
    private CustomerRepository customerRepository;

    @BeforeEach
    void setUp() {
        customerRepository.deleteAll();
    }

    @Test
    void contextLoads() {
        assertNotNull(datasetService);
        assertNotNull(segmentationService);
        assertNotNull(customerRepository);
    }

    @Test
    void testValidCsvUpload() {
        String csvContent = "CustomerID,Gender,Age,Annual Income (k$),Spending Score (1-100)\n" +
                "TEST-101,Female,25,45.5,65\n" +
                "TEST-102,Male,38,72.0,85\n";

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test_customers.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        UploadSummaryResponse summary = datasetService.processCsvUpload(file);

        assertEquals(2, summary.getTotalRows());
        assertEquals(2, summary.getValidRows());
        assertEquals(2, summary.getSavedRows());
        assertEquals(0, summary.getInvalidRows());
        assertEquals(0, summary.getDuplicateRows());
        assertTrue(summary.getErrors().isEmpty());

        assertEquals(2, customerRepository.count());
    }

    @Test
    void testInvalidRowsAndDuplicateDetection() {
        String csvContent = "CustomerID,Gender,Age,Annual Income (k$),Spending Score (1-100)\n" +
                "TEST-201,Female,22,30.0,50\n" +
                "TEST-201,Male,29,55.0,70\n" + // duplicate ID in CSV
                "TEST-202,Female,-5,40.0,60\n" + // invalid negative age
                "TEST-203,Male,35,40.0,150\n"; // spending score > 100

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test_errors.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        UploadSummaryResponse summary = datasetService.processCsvUpload(file);

        assertEquals(4, summary.getTotalRows());
        assertEquals(1, summary.getValidRows());
        assertEquals(1, summary.getSavedRows());
        assertEquals(2, summary.getInvalidRows());
        assertEquals(1, summary.getDuplicateRows());
        assertEquals(3, summary.getErrors().size());
    }

    @Test
    void testInvalidFileFormat() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "some content".getBytes(StandardCharsets.UTF_8)
        );

        assertThrows(InvalidFileException.class, () -> datasetService.processCsvUpload(file));
    }

    @Test
    void testSparkSegmentationAndMongoPersistence() {
        // Seed 6 customer records across 3 synthetic clusters
        customerRepository.save(new Customer("S1", "Male", 20, 15.0, 20, null));
        customerRepository.save(new Customer("S2", "Female", 22, 18.0, 22, null));
        customerRepository.save(new Customer("S3", "Male", 35, 80.0, 85, null));
        customerRepository.save(new Customer("S4", "Female", 38, 85.0, 90, null));
        customerRepository.save(new Customer("S5", "Male", 50, 90.0, 15, null));
        customerRepository.save(new Customer("S6", "Female", 55, 95.0, 18, null));

        assertEquals(6, customerRepository.count());

        // Run Spark segmentation with K=3
        SegmentationResult result = segmentationService.runSegmentation(3, 20);

        assertNotNull(result);
        assertEquals(3, result.getK());
        assertEquals(3, result.getClusterSummaries().size());
        assertEquals(6, result.getCustomerClusterAssignments().size());
        assertTrue(segmentationService.isSparkConnected());

        // Verify that MongoDB records now have cluster assignments persisted
        List<Customer> updated = customerRepository.findAll();
        for (Customer c : updated) {
            assertNotNull(c.getCluster(), "Cluster should be persisted to MongoDB for customer " + c.getCustomerId());
            assertTrue(c.getCluster() >= 0 && c.getCluster() < 3);
        }

        // Verify Elbow curve computation
        List<ElbowPoint> elbowPoints = segmentationService.getElbowCurve(2, 4, 15);
        assertNotNull(elbowPoints);
        assertEquals(3, elbowPoints.size()); // k=2, 3, 4
    }
}
