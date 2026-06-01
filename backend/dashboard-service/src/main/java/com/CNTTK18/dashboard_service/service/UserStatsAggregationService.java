package com.CNTTK18.dashboard_service.service;

import java.util.concurrent.CompletableFuture;

import com.CNTTK18.dashboard_service.dto.user.UserAdminStatsOverviewResponse;

public interface UserStatsAggregationService {
    CompletableFuture<UserAdminStatsOverviewResponse> getAdminStatsOverview();
}
