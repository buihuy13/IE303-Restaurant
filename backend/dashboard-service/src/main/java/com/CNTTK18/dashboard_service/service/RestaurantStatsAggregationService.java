package com.CNTTK18.dashboard_service.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.client.RestaurantDashboardDataClient;
import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantAdminStatsResponse;
import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantCountsResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RestaurantStatsAggregationService {
    private final RestaurantDashboardDataClient restaurantDashboardDataClient;

    public RestaurantAdminStatsResponse getAdminStats() {
        RestaurantCountsResponse counts = restaurantDashboardDataClient.getCounts();
        Double averageRating = restaurantDashboardDataClient.getAverageRating();

        long totalRestaurants = counts != null ? counts.getTotalRestaurants() : 0L;
        long totalProducts = counts != null ? counts.getTotalProducts() : 0L;
        long totalCategories = counts != null ? counts.getTotalCategories() : 0L;

        return RestaurantAdminStatsResponse.builder()
                .totalRestaurants(totalRestaurants)
                .totalProducts(totalProducts)
                .totalCategories(totalCategories)
                .averageRating(Optional.ofNullable(averageRating).orElse(0D))
                .build();
    }
}
