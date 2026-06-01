package com.CNTTK18.dashboard_service.service.Impl;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.dto.user.UserAdminStatsOverviewResponse;
import com.CNTTK18.dashboard_service.service.UserStatsAggregationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserStatsAggregationServiceImpl implements UserStatsAggregationService {
    private final DashboardCachedDataService dashboardCachedDataService;
    private final Executor dashboardExecutor;

    @Override
    public CompletableFuture<UserAdminStatsOverviewResponse> getAdminStatsOverview() {
        return CompletableFuture.supplyAsync(dashboardCachedDataService::getAdminStatsOverview, dashboardExecutor);
    }
}
