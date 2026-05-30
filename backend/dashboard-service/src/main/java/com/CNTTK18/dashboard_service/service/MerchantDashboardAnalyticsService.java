package com.CNTTK18.dashboard_service.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderSummaryDTO;

public interface MerchantDashboardAnalyticsService {
    DashboardStatsDTO.OverviewResponse getMerchantOverview(UUID restaurantId);

    default DashboardStatsDTO.RevenueResponse getMerchantRevenue(UUID restaurantId, String period) {
        return getMerchantRevenue(restaurantId, period, null, null, false);
    }

    DashboardStatsDTO.RevenueResponse getMerchantRevenue(
            UUID restaurantId, String period, LocalDate startDate, LocalDate endDate, boolean allTime);

    default DashboardStatsDTO.OrderStatusResponse getMerchantOrderStatus(UUID restaurantId, String period) {
        return getMerchantOrderStatus(restaurantId, period, null, null, false);
    }

    DashboardStatsDTO.OrderStatusResponse getMerchantOrderStatus(
            UUID restaurantId, String period, LocalDate startDate, LocalDate endDate, boolean allTime);

    default DashboardStatsDTO.TopProductsResponse getMerchantTopProducts(UUID restaurantId, String period, int limit) {
        return getMerchantTopProducts(restaurantId, period, limit, null, null, false);
    }

    DashboardStatsDTO.TopProductsResponse getMerchantTopProducts(
            UUID restaurantId, String period, int limit, LocalDate startDate, LocalDate endDate, boolean allTime);

    List<OrderSummaryDTO> getMerchantLiveOrders(UUID restaurantId);
}
