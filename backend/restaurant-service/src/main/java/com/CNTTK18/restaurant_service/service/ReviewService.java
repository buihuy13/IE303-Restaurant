package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.UUID;

import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.review.request.ReviewRequest;
import com.CNTTK18.restaurant_service.dto.review.response.ReviewListResponse;
import com.CNTTK18.restaurant_service.dto.review.response.ReviewResponse;

public interface ReviewService {
    public List<ReviewResponse> getAllReviews(UUID resId, UUID productId);

    public ReviewResponse getReviewById(UUID id);

    public ReviewResponse createReview(ReviewRequest reviewRequest);

    public void deleteReview(UUID id, UserRole authUser);

    public ReviewListResponse getProductReviewsById(UUID id);

    public ReviewListResponse getRestaurantReviewsById(UUID id);
}
