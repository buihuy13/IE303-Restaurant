package com.CNTTK18.dashboard_service.service.Impl;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantAdminStatsResponse;
import com.CNTTK18.dashboard_service.service.RestaurantStatsAggregationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RestaurantStatsAggregationServiceImpl implements RestaurantStatsAggregationService {
    private final DashboardCachedDataService dashboardCachedDataService;
    private final Executor dashboardExecutor;

    @Override
    public CompletableFuture<RestaurantAdminStatsResponse> getAdminStats() {
        return CompletableFuture.supplyAsync(dashboardCachedDataService::getRestaurantStats, dashboardExecutor);
    }
}
