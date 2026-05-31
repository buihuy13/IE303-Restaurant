package com.CNTTK18.dashboard_service.service;

import java.time.LocalDate;
import java.util.List;

import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderResponse;

public interface DashboardAnalyticsService {
    DashboardStatsDTO.OverviewResponse getOverview();

    default DashboardStatsDTO.RevenueResponse getRevenue(String period) {
        return getRevenue(period, null, null, false);
    }

    DashboardStatsDTO.RevenueResponse getRevenue(
            String period, LocalDate startDate, LocalDate endDate, boolean allTime);

    default DashboardStatsDTO.RevenueCompareResponse getRevenueCompare(String period) {
        return getRevenueCompare(period, null, null, false);
    }

    DashboardStatsDTO.RevenueCompareResponse getRevenueCompare(
            String period, LocalDate startDate, LocalDate endDate, boolean allTime);

    default DashboardStatsDTO.OrderStatusResponse getOrderStatusSummary(String period) {
        return getOrderStatusSummary(period, null, null, false);
    }

    DashboardStatsDTO.OrderStatusResponse getOrderStatusSummary(
            String period, LocalDate startDate, LocalDate endDate, boolean allTime);

    List<DashboardStatsDTO.HourlyOrderResponse> getHourlyOrders(LocalDate date);

    default DashboardStatsDTO.TopProductsResponse getTopProducts(String period, int limit) {
        return getTopProducts(period, limit, null, null, false);
    }

    DashboardStatsDTO.TopProductsResponse getTopProducts(
            String period, int limit, LocalDate startDate, LocalDate endDate, boolean allTime);

    default DashboardStatsDTO.RevenueByRestaurantResponse getRevenueByRestaurant(String period, int limit) {
        return getRevenueByRestaurant(period, limit, null, null, false);
    }

    DashboardStatsDTO.RevenueByRestaurantResponse getRevenueByRestaurant(
            String period, int limit, LocalDate startDate, LocalDate endDate, boolean allTime);

    List<OrderResponse> getRecentOrders(int limit);
}
