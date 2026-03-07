package com.CNTTK18.restaurant_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.restaurant_service.model.Categories;

@Repository
public interface CateRepository extends JpaRepository<Categories, String> {
    Optional<Categories> findByCateName(String name);
}
