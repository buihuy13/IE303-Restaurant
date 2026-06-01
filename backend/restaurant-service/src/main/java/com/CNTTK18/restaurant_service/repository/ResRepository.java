package com.CNTTK18.restaurant_service.repository;

import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import com.CNTTK18.restaurant_service.model.Restaurants;

@Repository
public interface ResRepository extends JpaRepository<Restaurants, UUID>, JpaSpecificationExecutor<Restaurants> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Restaurants> findRestaurantById(UUID id);

    Optional<Restaurants> findFirstByMerchantId(UUID id);

    Optional<Restaurants> findBySlug(String slug);
}
