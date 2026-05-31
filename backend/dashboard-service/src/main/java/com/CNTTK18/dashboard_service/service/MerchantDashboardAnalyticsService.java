package com.CNTTK18.dashboard_service.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderSummaryDTO;

public interface MerchantDashboardAnalyticsService {
    DashboardStatsDTO.OverviewResponse getMerchantOverview(UUID restaurantId);

    DashboardStatsDTO.RevenueResponse getMerchantRevenue(
            UUID restaurantId, String period, LocalDate startDate, LocalDate endDate);

    DashboardStatsDTO.OrderStatusResponse getMerchantOrderStatus(
            UUID restaurantId, String period, LocalDate startDate, LocalDate endDate);

    DashboardStatsDTO.TopProductsResponse getMerchantTopProducts(
            UUID restaurantId, String period, int limit, LocalDate startDate, LocalDate endDate);

    List<OrderSummaryDTO> getMerchantLiveOrders(UUID restaurantId);
}
