package com.CNTTK18.dashboard_service.service.Impl;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.dto.dashboard.AdminOverviewResponse;
import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantAdminStatsResponse;
import com.CNTTK18.dashboard_service.service.AsyncDashboardDataService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncDashboardDataServiceImpl implements AsyncDashboardDataService {

    private final DashboardCachedDataService dashboardCachedDataService;
    private final Executor dashboardExecutor;

    @Override
    public CompletableFuture<AdminOverviewResponse> getAdminOverviewAsync() {
        return CompletableFuture.supplyAsync(dashboardCachedDataService::getAdminOverview, dashboardExecutor);
    }

    @Override
    public CompletableFuture<RestaurantAdminStatsResponse> getRestaurantStatsAsync() {
        return CompletableFuture.supplyAsync(dashboardCachedDataService::getRestaurantStats, dashboardExecutor);
    }

    @Override
    public CompletableFuture<DashboardStatsDTO.OverviewResponse> getMerchantOverviewAsync(UUID restaurantId) {
        return CompletableFuture.supplyAsync(
                () -> dashboardCachedDataService.getMerchantOverview(restaurantId), dashboardExecutor);
    }
}
