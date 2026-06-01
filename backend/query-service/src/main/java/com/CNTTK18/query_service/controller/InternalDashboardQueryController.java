package com.CNTTK18.query_service.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.query_service.service.DashboardQueryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/dashboard")
@RequiredArgsConstructor
public class InternalDashboardQueryController {

    private final DashboardQueryService dashboardQueryService;

    @GetMapping("/restaurants/count")
    public ResponseEntity<Long> countRestaurants() {
        return ResponseEntity.ok(dashboardQueryService.countRestaurants());
    }

    @GetMapping("/products/count")
    public ResponseEntity<Long> countProducts() {
        return ResponseEntity.ok(dashboardQueryService.countProducts());
    }

    @GetMapping("/products/count-by-restaurant")
    public ResponseEntity<Long> countProductsByRestaurant(@RequestParam UUID restaurantId) {
        return ResponseEntity.ok(dashboardQueryService.countProductsByRestaurant(restaurantId));
    }

    @GetMapping("/restaurants/average-rating")
    public ResponseEntity<Double> getAverageRestaurantRating() {
        return ResponseEntity.ok(dashboardQueryService.getAverageRestaurantRating());
    }

    @GetMapping("/products/average-rating")
    public ResponseEntity<Double> getAverageProductRating() {
        return ResponseEntity.ok(dashboardQueryService.getAverageProductRating());
    }

    @GetMapping("/reviews/count")
    public ResponseEntity<Long> countTotalReviews() {
        return ResponseEntity.ok(dashboardQueryService.countTotalReviews());
    }

    @GetMapping("/reviews/count-by-restaurant")
    public ResponseEntity<Long> countReviewsByRestaurant(@RequestParam UUID restaurantId) {
        return ResponseEntity.ok(dashboardQueryService.countReviewsByRestaurant(restaurantId));
    }
}
