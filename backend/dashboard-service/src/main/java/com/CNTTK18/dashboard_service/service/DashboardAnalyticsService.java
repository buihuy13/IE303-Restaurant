package com.CNTTK18.dashboard_service.service;

import java.time.LocalDate;
import java.util.List;

import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderResponse;

public interface DashboardAnalyticsService {
    DashboardStatsDTO.OverviewResponse getOverview();

    DashboardStatsDTO.RevenueResponse getRevenue(String period, LocalDate startDate, LocalDate endDate);

    DashboardStatsDTO.RevenueCompareResponse getRevenueCompare(String period);

    DashboardStatsDTO.OrderStatusResponse getOrderStatusSummary(String period, LocalDate startDate, LocalDate endDate);

    List<DashboardStatsDTO.HourlyOrderResponse> getHourlyOrders(LocalDate date);

    DashboardStatsDTO.TopProductsResponse getTopProducts(String period, int limit, LocalDate startDate, LocalDate endDate);

    DashboardStatsDTO.RevenueByRestaurantResponse getRevenueByRestaurant(
            String period, int limit, LocalDate startDate, LocalDate endDate);

    List<OrderResponse> getRecentOrders(int limit);
}
