package com.CNTTK18.restaurant_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.restaurant_service.model.Reviews;
import com.CNTTK18.restaurant_service.model.data.ReviewType;

@Repository
public interface ReviewRepository extends JpaRepository<Reviews, UUID> {
    List<Reviews> findByReviewId(UUID id);

    List<Reviews> findByReviewIdAndReviewType(UUID reviewId, ReviewType reviewType);
}
