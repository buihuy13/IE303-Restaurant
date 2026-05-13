package com.CNTTK18.restaurant_service.controller;

import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.restaurant_service.client.feign.CatalogServiceFeignClient;
import com.CNTTK18.restaurant_service.dto.restaurant.response.RestaurantCountsResponse;
import com.CNTTK18.restaurant_service.repository.ResRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/dashboard/restaurants")
@RequiredArgsConstructor
public class InternalDashboardRestaurantController {
    private final ResRepository resRepository;
    private final CatalogServiceFeignClient catalogServiceClient;

    @GetMapping("/counts")
    public ResponseEntity<RestaurantCountsResponse> getCounts() {
        long totalRestaurants;
        try {
            totalRestaurants = resRepository.count();
        } catch (DataAccessException ex) {
            totalRestaurants = 0L;
        }

        // Products are now in product-service, set to 0 for now
        long totalProducts = 0L;

        // Get category count from catalog service
        long totalCategories = 0L;
        try {
            var allSizes = catalogServiceClient.getAllSizes();
            totalCategories = allSizes != null ? allSizes.size() : 0L;
        } catch (Exception ex) {
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
            // Get average rating from review service (using a default restaurant ID)
            // Since we need all restaurants average, we'll return a fallback value
            averageRestaurantRating = 0D;
        } catch (DataAccessException ex) {
            averageRestaurantRating = 0D;
        }

        return ResponseEntity.ok(averageRestaurantRating != null ? averageRestaurantRating : 0D);
    }
}
