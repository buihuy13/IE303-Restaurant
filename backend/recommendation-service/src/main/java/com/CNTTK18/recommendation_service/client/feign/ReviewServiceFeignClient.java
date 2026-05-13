package com.CNTTK18.recommendation_service.client.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.CNTTK18.recommendation_service.dto.review.ReviewListResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "review-service")
public interface ReviewServiceFeignClient {

    @GetMapping("/api/review/product/{id}")
    @CircuitBreaker(name = "reviewService")
    @Retry(name = "reviewService")
    ReviewListResponse getProductReviews(@PathVariable("id") String id);

    @GetMapping("/api/review/restaurant/{id}")
    @CircuitBreaker(name = "reviewService")
    @Retry(name = "reviewService")
    ReviewListResponse getRestaurantReviews(@PathVariable("id") String id);
}
