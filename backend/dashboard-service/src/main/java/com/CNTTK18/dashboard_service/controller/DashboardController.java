package com.CNTTK18.dashboard_service.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderResponse;
import com.CNTTK18.dashboard_service.service.DashboardAnalyticsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Admin dashboard analytics APIs")
public class DashboardController {
    private final DashboardAnalyticsService dashboardAnalyticsService;

    @GetMapping("/overview")
    @Operation(summary = "Get admin dashboard overview")
    public ResponseEntity<DashboardStatsDTO.OverviewResponse> getOverview() {
        return ResponseEntity.ok(dashboardAnalyticsService.getOverview());
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue analytics by period")
    public ResponseEntity<DashboardStatsDTO.RevenueResponse> getRevenue(
            @Parameter(description = "Supported values: day, week, month") @RequestParam(defaultValue = "week")
                    String period) {
        return ResponseEntity.ok(dashboardAnalyticsService.getRevenue(period));
    }

    @GetMapping("/revenue/compare")
    @Operation(summary = "Compare revenue between current and previous period")
    public ResponseEntity<DashboardStatsDTO.RevenueCompareResponse> getRevenueCompare(
            @Parameter(description = "Supported values: week, month") @RequestParam(defaultValue = "week")
                    String period) {
        return ResponseEntity.ok(dashboardAnalyticsService.getRevenueCompare(period));
    }

    @GetMapping("/orders/status")
    @Operation(summary = "Get order status summary by period")
    public ResponseEntity<DashboardStatsDTO.OrderStatusResponse> getOrderStatus(
            @Parameter(description = "Supported values: day, week, month") @RequestParam(defaultValue = "week")
                    String period) {
        return ResponseEntity.ok(dashboardAnalyticsService.getOrderStatusSummary(period));
    }

    @GetMapping("/orders/hourly")
    @Operation(summary = "Get hourly order distribution for a date")
    public ResponseEntity<List<DashboardStatsDTO.HourlyOrderResponse>> getHourlyOrders(
            @Parameter(description = "Date in format YYYY-MM-DD")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate date) {
        return ResponseEntity.ok(dashboardAnalyticsService.getHourlyOrders(date));
    }

    @GetMapping("/orders/recent")
    @Operation(summary = "Get recent orders")
    public ResponseEntity<List<OrderResponse>> getRecentOrders(
            @Parameter(description = "Number of records") @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardAnalyticsService.getRecentOrders(limit));
    }

    @GetMapping("/top-products")
    @Operation(summary = "Get top selling products")
    public ResponseEntity<DashboardStatsDTO.TopProductsResponse> getTopProducts(
            @Parameter(description = "Supported values: day, week, month") @RequestParam(defaultValue = "week")
                    String period,
            @Parameter(description = "Number of products") @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(dashboardAnalyticsService.getTopProducts(period, limit));
    }

    @GetMapping("/revenue/by-restaurant")
    @Operation(summary = "Get revenue grouped by restaurant")
    public ResponseEntity<DashboardStatsDTO.RevenueByRestaurantResponse> getRevenueByRestaurant(
            @Parameter(description = "Supported values: day, week, month") @RequestParam(defaultValue = "week")
                    String period,
            @Parameter(description = "Number of restaurants") @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardAnalyticsService.getRevenueByRestaurant(period, limit));
    }
}
