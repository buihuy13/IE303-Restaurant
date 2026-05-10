package com.CNTTK18.review_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.CNTTK18.review_service.model.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByReviewIdAndReviewType(
            UUID reviewId, com.CNTTK18.review_service.model.data.ReviewType reviewType);

    List<Review> findByUserId(UUID userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewId = :entityId AND r.reviewType = :reviewType")
    Float getAverageRating(
            @Param("entityId") UUID entityId,
            @Param("reviewType") com.CNTTK18.review_service.model.data.ReviewType reviewType);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewId = :entityId AND r.reviewType = :reviewType")
    Long getTotalReviews(
            @Param("entityId") UUID entityId,
            @Param("reviewType") com.CNTTK18.review_service.model.data.ReviewType reviewType);
}
