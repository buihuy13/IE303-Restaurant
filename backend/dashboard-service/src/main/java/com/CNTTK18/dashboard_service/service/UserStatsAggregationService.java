package com.CNTTK18.dashboard_service.service;

import com.CNTTK18.dashboard_service.dto.user.UserAdminStatsOverviewResponse;

public interface UserStatsAggregationService {
    UserAdminStatsOverviewResponse getAdminStatsOverview();
}
