package com.customersegmentation.controller;

import com.customersegmentation.dto.CustomerRequest;
import com.customersegmentation.dto.CustomerResponse;
import com.customersegmentation.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer cluster,
            @RequestParam(required = false) String gender) {
        List<CustomerResponse> customers = customerService.getAllCustomers(search, cluster, gender);
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable String id) {
        CustomerResponse customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse created = customerService.createCustomer(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable String id,
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse updated = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCustomer(@PathVariable String id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(Map.of("message", "Customer successfully deleted", "id", id));
    }
}

