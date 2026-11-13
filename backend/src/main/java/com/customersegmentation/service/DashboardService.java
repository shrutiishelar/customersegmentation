package com.customersegmentation.service;

import com.customersegmentation.dto.DashboardSummaryResponse;
import com.customersegmentation.model.Customer;
import com.customersegmentation.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;

    public DashboardService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public DashboardSummaryResponse getDashboardSummary() {
        List<Customer> customers = customerRepository.findAll();
        long totalCustomers = customers.size();

        if (totalCustomers == 0) {
            return new DashboardSummaryResponse(0, 0, 0.0, 0.0, 0.0, Map.of(), true);
        }

        // Calculate average annual income
        double avgIncome = customers.stream()
                .map(Customer::getAnnualIncome)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        // Calculate average spending score
        double avgSpending = customers.stream()
                .map(Customer::getSpendingScore)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        // Calculate average age
        double avgAge = customers.stream()
                .map(Customer::getAge)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        // Distinct clusters
        Set<Integer> distinctClusters = customers.stream()
                .map(Customer::getCluster)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Cluster distribution
        Map<String, Long> distribution = new LinkedHashMap<>();
        for (Integer c : distinctClusters) {
            long count = customers.stream().filter(cust -> Objects.equals(cust.getCluster(), c)).count();
            distribution.put("Cluster " + c, count);
        }

        long unassignedCount = customers.stream().filter(cust -> cust.getCluster() == null).count();
        if (unassignedCount > 0) {
            distribution.put("Unassigned", unassignedCount);
        }

        return new DashboardSummaryResponse(
                totalCustomers,
                distinctClusters.size(),
                round(avgIncome, 2),
                round(avgSpending, 2),
                round(avgAge, 2),
                distribution,
                true
        );
    }

    private double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}

