package com.CNTTK18.dashboard_service.service;

import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantAdminStatsResponse;

public interface RestaurantStatsAggregationService {
    RestaurantAdminStatsResponse getAdminStats();
}
