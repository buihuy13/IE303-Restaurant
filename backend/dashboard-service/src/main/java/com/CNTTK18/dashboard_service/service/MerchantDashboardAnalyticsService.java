package com.CNTTK18.dashboard_service.service;

import java.util.List;
import java.util.UUID;

import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderSummaryDTO;

public interface MerchantDashboardAnalyticsService {
    DashboardStatsDTO.OverviewResponse getMerchantOverview(UUID restaurantId);

    DashboardStatsDTO.RevenueResponse getMerchantRevenue(UUID restaurantId, String period);

    DashboardStatsDTO.OrderStatusResponse getMerchantOrderStatus(UUID restaurantId, String period);

    DashboardStatsDTO.TopProductsResponse getMerchantTopProducts(UUID restaurantId, String period, int limit);

    List<OrderSummaryDTO> getMerchantLiveOrders(UUID restaurantId);
}
