package com.CNTTK18.dashboard_service.service.Impl;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.client.CatalogDashboardDataClient;
import com.CNTTK18.dashboard_service.client.QueryDashboardDataClient;
import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantAdminStatsResponse;
import com.CNTTK18.dashboard_service.service.RestaurantStatsAggregationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RestaurantStatsAggregationServiceImpl implements RestaurantStatsAggregationService {
    private final QueryDashboardDataClient queryClient;
    private final CatalogDashboardDataClient catalogClient;
    private final Executor dashboardExecutor;

    @Override
    @Cacheable(value = "restaurant-stats", key = "'admin'")
    public CompletableFuture<RestaurantAdminStatsResponse> getAdminStats() {
        CompletableFuture<Long> totalRestaurants = supplyAsync(() -> queryClient.countRestaurants());
        CompletableFuture<Long> totalProducts = supplyAsync(() -> queryClient.countProducts());
        CompletableFuture<Long> totalCategories = supplyAsync(() -> catalogClient.countCategories());
        CompletableFuture<Double> avgRating = supplyAsync(() -> queryClient.getAverageRestaurantRating());
        CompletableFuture<Long> totalReviews = supplyAsync(() -> queryClient.countTotalReviews());

        return CompletableFuture.allOf(totalRestaurants, totalProducts, totalCategories, avgRating, totalReviews)
                .thenApply(voidResult -> RestaurantAdminStatsResponse.builder()
                        .totalRestaurants(totalRestaurants.join())
                        .totalProducts(totalProducts.join())
                        .totalCategories(totalCategories.join())
                        .averageRating(Optional.ofNullable(avgRating.join()).orElse(0.0))
                        .totalReviews(totalReviews.join())
                        .build());
    }

    private <T> CompletableFuture<T> supplyAsync(java.util.function.Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(supplier, dashboardExecutor);
    }
}
