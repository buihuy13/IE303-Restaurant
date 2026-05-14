package com.CNTTK18.dashboard_service.client;

import java.util.Map;
import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.CNTTK18.dashboard_service.dto.review.ReviewStatsResponse;

@FeignClient(name = "review-service")
public interface ReviewDashboardDataClient {

    @GetMapping("/api/review/stats/restaurant/{id}")
    ReviewStatsResponse getRestaurantStats(@PathVariable("id") UUID id);

    @GetMapping("/api/review/stats/product/{id}")
    ReviewStatsResponse getProductStats(@PathVariable("id") UUID id);

    @GetMapping("/internal/dashboard/reviews/rating-distribution")
    Map<Integer, Long> getGlobalRatingDistribution();
}
