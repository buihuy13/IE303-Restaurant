package com.CNTTK18.review_service.service.impl;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.review_service.dto.review.request.ReviewRequest;
import com.CNTTK18.review_service.dto.review.response.ReviewListResponse;
import com.CNTTK18.review_service.dto.review.response.ReviewResponse;
import com.CNTTK18.review_service.dto.review.response.ReviewStatsResponse;
import com.CNTTK18.review_service.model.Review;
import com.CNTTK18.review_service.model.data.ReviewType;
import com.CNTTK18.review_service.repository.ReviewRepository;
import com.CNTTK18.review_service.service.ReviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    public List<ReviewResponse> getAllReviews(UUID resId, UUID productId) {
        if (resId != null) {
            List<Review> reviews = reviewRepository.findByReviewIdAndReviewType(resId, ReviewType.RESTAURANT);
            return reviews.stream().map(this::mapToResponse).toList();
        } else if (productId != null) {
            List<Review> reviews = reviewRepository.findByReviewIdAndReviewType(productId, ReviewType.PRODUCT);
            return reviews.stream().map(this::mapToResponse).toList();
        }
        return reviewRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public ReviewResponse getReviewById(UUID id) {
        Review review = reviewRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));
        return mapToResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest reviewRequest) {
        Review review = Review.builder()
                .userId(reviewRequest.getUserId())
                .reviewId(reviewRequest.getReviewId())
                .reviewType(reviewRequest.getReviewType())
                .title(reviewRequest.getTitle())
                .content(reviewRequest.getContent())
                .rating(reviewRequest.getRating())
                .build();
        Review savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    @Override
    @Transactional
    public void deleteReview(UUID id, UUID userId) {
        Review review = reviewRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));
        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this review");
        }
        reviewRepository.deleteById(id);
    }

    @Override
    public ReviewListResponse getProductReviewsById(UUID id) {
        List<Review> reviews = reviewRepository.findByReviewIdAndReviewType(id, ReviewType.PRODUCT);
        return ReviewListResponse.builder()
                .reviews(reviews.stream().map(this::mapToResponse).toList())
                .total(reviews.size())
                .build();
    }

    @Override
    public ReviewListResponse getRestaurantReviewsById(UUID id) {
        List<Review> reviews = reviewRepository.findByReviewIdAndReviewType(id, ReviewType.RESTAURANT);
        return ReviewListResponse.builder()
                .reviews(reviews.stream().map(this::mapToResponse).toList())
                .total(reviews.size())
                .build();
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

        Double averageRating =
                reviews.stream().mapToDouble(Review::getRating).average().orElse(0.0);

        Map<Integer, Long> ratingDistribution = reviews.stream()
                .collect(Collectors.groupingBy(r -> (int) Math.floor(r.getRating()), Collectors.counting()));

        return ReviewStatsResponse.builder()
                .averageRating(averageRating)
                .totalReviews((long) reviews.size())
                .ratingDistribution(ratingDistribution)
                .build();
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .reviewId(review.getReviewId())
                .reviewType(review.getReviewType())
                .title(review.getTitle())
                .content(review.getContent())
                .rating(review.getRating())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
