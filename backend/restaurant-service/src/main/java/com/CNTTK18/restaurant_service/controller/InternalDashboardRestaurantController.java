package com.CNTTK18.restaurant_service.controller;

import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.restaurant_service.dto.restaurant.response.RestaurantCountsResponse;
import com.CNTTK18.restaurant_service.repository.CateRepository;
import com.CNTTK18.restaurant_service.repository.ProductRepository;
import com.CNTTK18.restaurant_service.repository.ResRepository;
import com.CNTTK18.restaurant_service.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/dashboard/restaurants")
@RequiredArgsConstructor
public class InternalDashboardRestaurantController {
    private final ResRepository resRepository;
    private final ProductRepository productRepository;
    private final CateRepository cateRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping("/counts")
    public ResponseEntity<RestaurantCountsResponse> getCounts() {
        long totalRestaurants;
        try {
            totalRestaurants = resRepository.count();
        } catch (DataAccessException ex) {
            totalRestaurants = 0L;
        }

        long totalProducts;
        try {
            totalProducts = productRepository.count();
        } catch (DataAccessException ex) {
            totalProducts = 0L;
        }

        long totalCategories;
        try {
            totalCategories = cateRepository.count();
        } catch (DataAccessException ex) {
            totalCategories = 0L;
        }

        return ResponseEntity.ok(RestaurantCountsResponse.builder()
                .totalRestaurants(totalRestaurants)
                .totalProducts(totalProducts)
                .totalCategories(totalCategories)
                .build());
    }

    @GetMapping("/average-rating")
    public ResponseEntity<Double> getAverageRating() {
        Double averageRestaurantRating;
        try {
            averageRestaurantRating = reviewRepository.getAverageRestaurantRating();
        } catch (DataAccessException ex) {
            averageRestaurantRating = 0D;
        }

        return ResponseEntity.ok(averageRestaurantRating != null ? averageRestaurantRating : 0D);
    }
}
