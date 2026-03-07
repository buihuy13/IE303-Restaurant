package com.CNTTK18.restaurant_service.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.restaurant_service.model.Reviews;

@Repository
public interface ReviewRepository extends JpaRepository<Reviews, String> {
    List<Reviews> findByReviewId(String id);

    Page<Reviews> findByReviewTypeAndReviewId(String reviewType, String reviewId, Pageable pageable);
}
