package com.CNTTK18.dashboard_service.service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import com.CNTTK18.dashboard_service.dto.dashboard.AdminOverviewResponse;
import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantAdminStatsResponse;

public interface AsyncDashboardDataService {
    CompletableFuture<AdminOverviewResponse> getAdminOverviewAsync();

    CompletableFuture<RestaurantAdminStatsResponse> getRestaurantStatsAsync();

    CompletableFuture<DashboardStatsDTO.OverviewResponse> getMerchantOverviewAsync(UUID restaurantId);
}
