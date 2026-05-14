package com.CNTTK18.dashboard_service.service;

import java.util.concurrent.CompletableFuture;

import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantAdminStatsResponse;

public interface RestaurantStatsAggregationService {
    CompletableFuture<RestaurantAdminStatsResponse> getAdminStats();
}
