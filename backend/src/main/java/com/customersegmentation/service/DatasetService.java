package com.customersegmentation.service;

import com.customersegmentation.dto.UploadSummaryResponse;
import com.customersegmentation.dto.UploadSummaryResponse.RowError;
import com.customersegmentation.exception.InvalidFileException;
import com.customersegmentation.model.Customer;
import com.customersegmentation.repository.CustomerRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DatasetService {

    private final CustomerRepository customerRepository;

    public DatasetService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public UploadSummaryResponse processCsvUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Uploaded file is empty or missing.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".csv")) {
            throw new InvalidFileException("Invalid file format. Only CSV files (.csv) are accepted.");
        }

        List<Customer> validCustomers = new ArrayList<>();
        List<RowError> errors = new ArrayList<>();
        Set<String> seenInCsv = new HashSet<>();
        int totalRows = 0;
        int duplicateRows = 0;
        int invalidRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build();

            CSVParser parser = csvFormat.parse(reader);
            Map<String, Integer> headerMap = parser.getHeaderMap();

            // Locate required column header names safely
            String idCol = findColumn(headerMap, "customerid", "customer_id", "id");
            String genderCol = findColumn(headerMap, "gender", "sex");
            String ageCol = findColumn(headerMap, "age");
            String incomeCol = findColumn(headerMap, "annual income (k$)", "annual income(k$)", "annualincome", "annual_income", "annual income");
            String spendingCol = findColumn(headerMap, "spending score (1-100)", "spending score(1-100)", "spendingscore", "spending_score", "spending score");
            String clusterCol = findColumn(headerMap, "cluster", "clusterid", "cluster_id");

            if (idCol == null || genderCol == null || ageCol == null || incomeCol == null || spendingCol == null) {
                throw new InvalidFileException("Missing required CSV columns. Required: CustomerID, Gender, Age, Annual Income (k$), Spending Score (1-100). Found headers: " + headerMap.keySet());
            }

            int rowNumber = 1; // 1-based index (row 1 is first data row after header)
            for (CSVRecord record : parser) {
                rowNumber++;
                totalRows++;

                // Extract and clean cell values
                String rawId = safeGet(record, idCol);
                String rawGender = safeGet(record, genderCol);
                String rawAge = safeGet(record, ageCol);
                String rawIncome = safeGet(record, incomeCol);
                String rawSpending = safeGet(record, spendingCol);
                String rawCluster = clusterCol != null ? safeGet(record, clusterCol) : null;

                // Validation 1: Check missing values
                if (rawId == null || rawId.isBlank()) {
                    invalidRows++;
                    errors.add(new RowError(rowNumber, "N/A", "Missing CustomerID"));
                    continue;
                }

                String customerId = rawId.trim();

                // Validation 2: Check duplicate within the uploaded CSV
                if (!seenInCsv.add(customerId.toLowerCase())) {
                    duplicateRows++;
                    errors.add(new RowError(rowNumber, customerId, "Duplicate CustomerID within the uploaded CSV"));
                    continue;
                }

                // Validation 3: Check duplicate in existing database
                if (customerRepository.existsByCustomerId(customerId)) {
                    duplicateRows++;
                    errors.add(new RowError(rowNumber, customerId, "CustomerID already exists in MongoDB database"));
                    continue;
                }

                // Validation 4: Gender validation
                String gender = rawGender != null ? rawGender.trim() : "";
                if (gender.isBlank()) {
                    invalidRows++;
                    errors.add(new RowError(rowNumber, customerId, "Missing Gender value"));
                    continue;
                }

                // Validation 5: Age numeric range (1 - 120)
                Integer age;
                try {
                    age = Integer.parseInt(rawAge);
                    if (age < 1 || age > 120) {
                        invalidRows++;
                        errors.add(new RowError(rowNumber, customerId, "Age out of valid range (1 - 120): " + rawAge));
                        continue;
                    }
                } catch (Exception e) {
                    invalidRows++;
                    errors.add(new RowError(rowNumber, customerId, "Invalid numeric format for Age: '" + rawAge + "'"));
                    continue;
                }

                // Validation 6: Annual Income numeric positive
                Double annualIncome;
                try {
                    annualIncome = Double.parseDouble(rawIncome);
                    if (annualIncome < 0) {
                        invalidRows++;
                        errors.add(new RowError(rowNumber, customerId, "Annual income cannot be negative: " + rawIncome));
                        continue;
                    }
                } catch (Exception e) {
                    invalidRows++;
                    errors.add(new RowError(rowNumber, customerId, "Invalid numeric format for Annual Income: '" + rawIncome + "'"));
                    continue;
                }

                // Validation 7: Spending Score (1 - 100)
                Integer spendingScore;
                try {
                    spendingScore = Integer.parseInt(rawSpending);
                    if (spendingScore < 1 || spendingScore > 100) {
                        invalidRows++;
                        errors.add(new RowError(rowNumber, customerId, "Spending score out of valid range (1 - 100): " + rawSpending));
                        continue;
                    }
                } catch (Exception e) {
                    invalidRows++;
                    errors.add(new RowError(rowNumber, customerId, "Invalid numeric format for Spending Score: '" + rawSpending + "'"));
                    continue;
                }

                // Optional cluster assignment from CSV if pre-segmented
                Integer cluster = null;
                if (rawCluster != null && !rawCluster.isBlank()) {
                    try {
                        cluster = Integer.parseInt(rawCluster.trim());
                    } catch (Exception ignored) {
                    }
                }

                // Construct valid customer entity
                Customer customer = new Customer();
                customer.setCustomerId(customerId);
                customer.setGender(gender);
                customer.setAge(age);
                customer.setAnnualIncome(annualIncome);
                customer.setSpendingScore(spendingScore);
                customer.setCluster(cluster);
                customer.setCreatedAt(LocalDateTime.now());
                customer.setUpdatedAt(LocalDateTime.now());

                validCustomers.add(customer);
            }
        } catch (InvalidFileException ife) {
            throw ife;
        } catch (Exception ex) {
            throw new InvalidFileException("Failed to parse CSV file: " + ex.getMessage());
        }

        // Save only valid records to MongoDB
        int savedRows = 0;
        if (!validCustomers.isEmpty()) {
            List<Customer> saved = customerRepository.saveAll(validCustomers);
            savedRows = saved.size();
        }

        int validRows = validCustomers.size();
        String message = String.format("Processed %d rows: %d saved successfully, %d invalid, %d duplicates.",
                totalRows, savedRows, invalidRows, duplicateRows);

        return new UploadSummaryResponse(totalRows, validRows, invalidRows, duplicateRows, savedRows, errors, message);
    }

    private String findColumn(Map<String, Integer> headerMap, String... candidates) {
        for (String key : headerMap.keySet()) {
            String normalizedKey = key.trim().toLowerCase();
            for (String candidate : candidates) {
                if (normalizedKey.equals(candidate)) {
                    return key;
                }
            }
        }
        return null;
    }

    private String safeGet(CSVRecord record, String colName) {
        if (colName != null && record.isMapped(colName)) {
            return record.get(colName);
        }
        return null;
    }
}

