package com.customersegmentation.repository;

import com.customersegmentation.model.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, String> {

    Optional<Customer> findByCustomerId(String customerId);

    boolean existsByCustomerId(String customerId);

    List<Customer> findByCluster(Integer cluster);

    List<Customer> findByGenderIgnoreCase(String gender);

    void deleteByCustomerId(String customerId);
}

