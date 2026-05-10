package com.CNTTK18.restaurant_service.client;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.restaurant_service.dto.review.response.ReviewListResponse;
import com.CNTTK18.restaurant_service.dto.review.response.ReviewResponse;
import com.CNTTK18.restaurant_service.dto.review.response.ReviewStatsResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewServiceClient {

    private final WebClient.Builder webClientBuilder;

    private static final String REVIEW_SERVICE = "reviewService";
    private static final String REVIEW_SERVICE_URL = "http://review-service";

    @CircuitBreaker(name = REVIEW_SERVICE, fallbackMethod = "getProductReviewsFallback")
    public List<ReviewResponse> getProductReviews(UUID productId) {
        ReviewListResponse response = webClientBuilder
                .build()
                .get()
                .uri(REVIEW_SERVICE_URL + "/api/review/product/{id}", productId)
                .retrieve()
                .bodyToMono(ReviewListResponse.class)
                .timeout(Duration.ofSeconds(3))
                .block();
        return response != null ? response.getReviews() : List.of();
    }

    @CircuitBreaker(name = REVIEW_SERVICE, fallbackMethod = "getRestaurantReviewsFallback")
    public List<ReviewResponse> getRestaurantReviews(UUID restaurantId) {
        ReviewListResponse response = webClientBuilder
                .build()
                .get()
                .uri(REVIEW_SERVICE_URL + "/api/review/restaurant/{id}", restaurantId)
                .retrieve()
                .bodyToMono(ReviewListResponse.class)
                .timeout(Duration.ofSeconds(3))
                .block();
        return response != null ? response.getReviews() : List.of();
    }

    @CircuitBreaker(name = REVIEW_SERVICE, fallbackMethod = "getProductStatsFallback")
    public ReviewStatsResponse getProductReviewStats(UUID productId) {
        return webClientBuilder
                .build()
                .get()
                .uri(REVIEW_SERVICE_URL + "/api/review/stats/product/{id}", productId)
                .retrieve()
                .bodyToMono(ReviewStatsResponse.class)
                .timeout(Duration.ofSeconds(3))
                .block();
    }

    @CircuitBreaker(name = REVIEW_SERVICE, fallbackMethod = "getRestaurantStatsFallback")
    public ReviewStatsResponse getRestaurantReviewStats(UUID restaurantId) {
        return webClientBuilder
                .build()
                .get()
                .uri(REVIEW_SERVICE_URL + "/api/review/stats/restaurant/{id}", restaurantId)
                .retrieve()
                .bodyToMono(ReviewStatsResponse.class)
                .timeout(Duration.ofSeconds(3))
                .block();
    }

    // Fallback methods
    private List<ReviewResponse> getProductReviewsFallback(UUID productId, Throwable throwable) {
        log.error("Failed to get product reviews {}: {}", productId, throwable.getMessage());
        return List.of();
    }

    private List<ReviewResponse> getRestaurantReviewsFallback(UUID restaurantId, Throwable throwable) {
        log.error("Failed to get restaurant reviews {}: {}", restaurantId, throwable.getMessage());
        return List.of();
    }

    private ReviewStatsResponse getProductStatsFallback(UUID productId, Throwable throwable) {
        log.error("Failed to get product stats {}: {}", productId, throwable.getMessage());
        return ReviewStatsResponse.builder().averageRating(0.0).totalReviews(0L).build();
    }

    private ReviewStatsResponse getRestaurantStatsFallback(UUID restaurantId, Throwable throwable) {
        log.error("Failed to get restaurant stats {}: {}", restaurantId, throwable.getMessage());
        return ReviewStatsResponse.builder().averageRating(0.0).totalReviews(0L).build();
    }
}
