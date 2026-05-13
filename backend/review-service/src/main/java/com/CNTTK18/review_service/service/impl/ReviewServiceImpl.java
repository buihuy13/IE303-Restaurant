package com.CNTTK18.review_service.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.review_service.client.ProductServiceClient;
import com.CNTTK18.review_service.client.RestaurantServiceClient;
import com.CNTTK18.review_service.client.UserServiceClient;
import com.CNTTK18.review_service.dto.review.request.ReviewRequest;
import com.CNTTK18.review_service.dto.review.response.ReviewListResponse;
import com.CNTTK18.review_service.dto.review.response.ReviewResponse;
import com.CNTTK18.review_service.dto.review.response.ReviewStatsResponse;
import com.CNTTK18.review_service.event.publisher.ReviewEventPublisher;
import com.CNTTK18.review_service.mapper.ReviewMapper;
import com.CNTTK18.review_service.model.Review;
import com.CNTTK18.review_service.model.data.ReviewType;
import com.CNTTK18.review_service.repository.ReviewRepository;
import com.CNTTK18.review_service.service.ReviewService;

import feign.FeignException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final UserServiceClient userServiceClient;
    private final ProductServiceClient productServiceClient;
    private final RestaurantServiceClient restaurantServiceClient;
    private final ReviewEventPublisher reviewEventPublisher;

    @Override
    public List<ReviewResponse> getAllReviews(UUID resId, UUID productId) {
        if (resId != null) {
            List<Review> reviews = reviewRepository.findByReviewIdAndReviewType(resId, ReviewType.RESTAURANT);
            return reviews.stream().map(reviewMapper::toReviewResponse).toList();
        } else if (productId != null) {
            List<Review> reviews = reviewRepository.findByReviewIdAndReviewType(productId, ReviewType.PRODUCT);
            return reviews.stream().map(reviewMapper::toReviewResponse).toList();
        }
        return reviewRepository.findAll().stream()
                .map(reviewMapper::toReviewResponse)
                .toList();
    }

    @Override
    public ReviewResponse getReviewById(UUID id) {
        Review review = reviewRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        return reviewMapper.toReviewResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest reviewRequest) {
        validateUserExists(reviewRequest.getUserId());
        validateReviewTargetExists(reviewRequest.getReviewType(), reviewRequest.getReviewId());

        Review review = Review.builder()
                .userId(reviewRequest.getUserId())
                .reviewId(reviewRequest.getReviewId())
                .reviewType(reviewRequest.getReviewType())
                .title(reviewRequest.getTitle())
                .content(reviewRequest.getContent())
                .rating(reviewRequest.getRating())
                .build();
        Review savedReview = reviewRepository.save(review);
        publishReviewSummaryUpdated(savedReview.getReviewType(), savedReview.getReviewId());
        return reviewMapper.toReviewResponse(savedReview);
    }

    @Override
    @Transactional
    public void deleteReview(UUID id, UUID userId) {
        Review review = reviewRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this review");
        }
        UUID targetId = review.getReviewId();
        ReviewType reviewType = review.getReviewType();
        reviewRepository.deleteById(id);
        publishReviewSummaryUpdated(reviewType, targetId);
    }

    @Override
    public ReviewListResponse getProductReviewsById(UUID id) {
        List<Review> reviews = reviewRepository.findByReviewIdAndReviewType(id, ReviewType.PRODUCT);
        return reviewMapper.toReviewListResponse(reviews);
    }

    @Override
    public ReviewListResponse getRestaurantReviewsById(UUID id) {
        List<Review> reviews = reviewRepository.findByReviewIdAndReviewType(id, ReviewType.RESTAURANT);
        return reviewMapper.toReviewListResponse(reviews);
    }

    @Override
    public ReviewStatsResponse getProductReviewStats(UUID id) {
        return getReviewStats(id, ReviewType.PRODUCT);
    }

    @Override
    public ReviewStatsResponse getRestaurantReviewStats(UUID id) {
        return getReviewStats(id, ReviewType.RESTAURANT);
    }

    private ReviewStatsResponse getReviewStats(UUID id, ReviewType reviewType) {
        List<Review> reviews = reviewRepository.findByReviewIdAndReviewType(id, reviewType);
        return reviewMapper.toReviewStats(reviews);
    }

    private void validateUserExists(UUID userId) {
        try {
            userServiceClient.getUserById(userId);
        } catch (FeignException.NotFound ex) {
            throw new ResourceNotFoundException("Không tồn tại user");
        }
    }

    private void validateReviewTargetExists(ReviewType reviewType, UUID reviewId) {
        try {
            switch (reviewType) {
                case PRODUCT -> productServiceClient.getProductById(reviewId);
                case RESTAURANT -> restaurantServiceClient.getRestaurantById(reviewId);
                default -> throw new IllegalArgumentException("Review Type phải là PRODUCT hoặc RESTAURANT");
            }
        } catch (FeignException.NotFound ex) {
            if (ReviewType.PRODUCT.equals(reviewType)) {
                throw new ResourceNotFoundException("Product not found");
            }
            if (ReviewType.RESTAURANT.equals(reviewType)) {
                throw new ResourceNotFoundException("Restaurant not found");
            }
            throw ex;
        }
    }

    private void publishReviewSummaryUpdated(ReviewType reviewType, UUID reviewId) {
        Float averageRating = reviewRepository.getAverageRating(reviewId, reviewType);
        Long totalReviews = reviewRepository.getTotalReviews(reviewId, reviewType);
        float rating = averageRating == null ? 0f : averageRating;
        int totalReview = totalReviews == null ? 0 : totalReviews.intValue();

        switch (reviewType) {
            case PRODUCT -> reviewEventPublisher.publishProductReviewSummaryUpdated(reviewId, rating, totalReview);
            case RESTAURANT ->
                reviewEventPublisher.publishRestaurantReviewSummaryUpdated(reviewId, rating, totalReview);
            default -> throw new IllegalArgumentException("Review Type phải là PRODUCT hoặc RESTAURANT");
        }
    }
}
