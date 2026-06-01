package com.CNTTK18.dashboard_service.client;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "query-service")
public interface QueryDashboardDataClient {

    @GetMapping("/internal/dashboard/restaurants/count")
    long countRestaurants();

    @GetMapping("/internal/dashboard/products/count")
    long countProducts();

    @GetMapping("/internal/dashboard/products/count-by-restaurant")
    long countProductsByRestaurant(@RequestParam("restaurantId") UUID restaurantId);

    @GetMapping("/internal/dashboard/restaurants/average-rating")
    Double getAverageRestaurantRating();

    @GetMapping("/internal/dashboard/products/average-rating")
    Double getAverageProductRating();

    @GetMapping("/internal/dashboard/reviews/count")
    long countTotalReviews();

    @GetMapping("/internal/dashboard/reviews/count-by-restaurant")
    long countReviewsByRestaurant(@RequestParam("restaurantId") UUID restaurantId);
}
