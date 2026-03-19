package com.CNTTK18.order_service.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.order_service.model.Order;

@Repository
public interface OrderRepository extends MongoRepository<Order, UUID> {
    Page<Order> findByUserId(UUID userId, Pageable pageable);
    Page<Order> findByRestaurantId(UUID restaurantId, Pageable pageable);
}
