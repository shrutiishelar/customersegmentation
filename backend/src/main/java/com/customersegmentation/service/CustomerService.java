package com.customersegmentation.service;

import com.customersegmentation.dto.CustomerRequest;
import com.customersegmentation.dto.CustomerResponse;
import com.customersegmentation.exception.DuplicateResourceException;
import com.customersegmentation.exception.ResourceNotFoundException;
import com.customersegmentation.model.Customer;
import com.customersegmentation.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<CustomerResponse> getAllCustomers(String search, Integer cluster, String gender) {
        List<Customer> list = customerRepository.findAll();

        return list.stream()
                .filter(c -> {
                    if (cluster != null && !cluster.equals(c.getCluster())) {
                        return false;
                    }
                    if (gender != null && !gender.isBlank() && !gender.equalsIgnoreCase("all")) {
                        if (c.getGender() == null || !c.getGender().equalsIgnoreCase(gender)) {
                            return false;
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase().trim();
                        boolean matchesId = c.getCustomerId() != null && c.getCustomerId().toLowerCase().contains(q);
                        boolean matchesAge = c.getAge() != null && String.valueOf(c.getAge()).contains(q);
                        boolean matchesIncome = c.getAnnualIncome() != null && String.valueOf(c.getAnnualIncome()).contains(q);
                        boolean matchesSpending = c.getSpendingScore() != null && String.valueOf(c.getSpendingScore()).contains(q);
                        return matchesId || matchesAge || matchesIncome || matchesSpending;
                    }
                    return true;
                })
                .map(CustomerResponse::new)
                .collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(String idOrCustomerId) {
        Customer customer = findByIdOrCustomerId(idOrCustomerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with identifier: " + idOrCustomerId));
        return new CustomerResponse(customer);
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.existsByCustomerId(request.getCustomerId())) {
            throw new DuplicateResourceException("Customer ID already exists: " + request.getCustomerId());
        }

        Customer customer = new Customer();
        customer.setCustomerId(request.getCustomerId());
        customer.setGender(request.getGender());
        customer.setAge(request.getAge());
        customer.setAnnualIncome(request.getAnnualIncome());
        customer.setSpendingScore(request.getSpendingScore());
        customer.setCluster(request.getCluster());
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        Customer saved = customerRepository.save(customer);
        return new CustomerResponse(saved);
    }

    public CustomerResponse updateCustomer(String idOrCustomerId, CustomerRequest request) {
        Customer customer = findByIdOrCustomerId(idOrCustomerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with identifier: " + idOrCustomerId));

        // If customerId is being changed, ensure uniqueness
        if (!customer.getCustomerId().equals(request.getCustomerId()) &&
                customerRepository.existsByCustomerId(request.getCustomerId())) {
            throw new DuplicateResourceException("Customer ID already exists: " + request.getCustomerId());
        }

        customer.setCustomerId(request.getCustomerId());
        customer.setGender(request.getGender());
        customer.setAge(request.getAge());
        customer.setAnnualIncome(request.getAnnualIncome());
        customer.setSpendingScore(request.getSpendingScore());
        customer.setCluster(request.getCluster());
        customer.setUpdatedAt(LocalDateTime.now());

        Customer updated = customerRepository.save(customer);
        return new CustomerResponse(updated);
    }

    public void deleteCustomer(String idOrCustomerId) {
        Customer customer = findByIdOrCustomerId(idOrCustomerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with identifier: " + idOrCustomerId));
        customerRepository.delete(customer);
    }

    private Optional<Customer> findByIdOrCustomerId(String idOrCustomerId) {
        Optional<Customer> byId = customerRepository.findById(idOrCustomerId);
        if (byId.isPresent()) {
            return byId;
        }
        return customerRepository.findByCustomerId(idOrCustomerId);
    }
}

