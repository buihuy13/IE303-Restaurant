package com.CNTTK18.dashboard_service.service;

import java.time.LocalDate;
import java.util.List;

import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderResponse;

public interface DashboardAnalyticsService {
    DashboardStatsDTO.OverviewResponse getOverview();

    DashboardStatsDTO.RevenueResponse getRevenue(String period);

    DashboardStatsDTO.RevenueCompareResponse getRevenueCompare(String period);

    DashboardStatsDTO.OrderStatusResponse getOrderStatusSummary(String period);

    List<DashboardStatsDTO.HourlyOrderResponse> getHourlyOrders(LocalDate date);

    DashboardStatsDTO.TopProductsResponse getTopProducts(String period, int limit);

    DashboardStatsDTO.RevenueByRestaurantResponse getRevenueByRestaurant(String period, int limit);

    List<OrderResponse> getRecentOrders(int limit);
}
