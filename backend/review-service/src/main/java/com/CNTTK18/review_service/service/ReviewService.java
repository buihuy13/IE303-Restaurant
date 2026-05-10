package com.CNTTK18.review_service.service;

import java.util.List;
import java.util.UUID;

import com.CNTTK18.review_service.dto.review.request.ReviewRequest;
import com.CNTTK18.review_service.dto.review.response.ReviewListResponse;
import com.CNTTK18.review_service.dto.review.response.ReviewResponse;
import com.CNTTK18.review_service.dto.review.response.ReviewStatsResponse;

public interface ReviewService {
    List<ReviewResponse> getAllReviews(UUID resId, UUID productId);

    ReviewResponse getReviewById(UUID id);

    ReviewResponse createReview(ReviewRequest reviewRequest);

    void deleteReview(UUID id, UUID userId);

    ReviewListResponse getProductReviewsById(UUID id);

    ReviewListResponse getRestaurantReviewsById(UUID id);

    ReviewStatsResponse getProductReviewStats(UUID id);

    ReviewStatsResponse getRestaurantReviewStats(UUID id);
}
