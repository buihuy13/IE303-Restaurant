package com.CNTTK18.catalog_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.catalog_service.model.Size;

@Repository
public interface SizeRepository extends JpaRepository<Size, UUID> {
    Optional<Size> findByName(String name);

    boolean existsByName(String name);
}
