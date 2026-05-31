package com.CNTTK18.dashboard_service.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderSummaryDTO;
import com.CNTTK18.dashboard_service.service.MerchantDashboardAnalyticsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/merchant/dashboard")
@RequiredArgsConstructor
@Tag(name = "Merchant Dashboard", description = "Merchant dashboard analytics APIs")
public class MerchantDashboardController {
    private final MerchantDashboardAnalyticsService merchantDashboardAnalyticsService;

    @GetMapping("/overview")
    @Operation(summary = "Get merchant overview metrics")
    public ResponseEntity<DashboardStatsDTO.OverviewResponse> getMerchantOverview(
            @Parameter(description = "Restaurant ID") @RequestParam UUID restaurantId) {
        return ResponseEntity.ok(merchantDashboardAnalyticsService.getMerchantOverview(restaurantId));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get merchant revenue by period")
    public ResponseEntity<DashboardStatsDTO.RevenueResponse> getMerchantRevenue(
            @Parameter(description = "Restaurant ID") @RequestParam UUID restaurantId,
            @Parameter(description = "Supported values: day, week, month") @RequestParam(defaultValue = "week")
                    String period,
            @Parameter(description = "Start date in format YYYY-MM-DD")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate startDate,
            @Parameter(description = "End date in format YYYY-MM-DD")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate endDate,
            @Parameter(description = "Use all records through today") @RequestParam(defaultValue = "false")
                    boolean allTime) {
        return ResponseEntity.ok(merchantDashboardAnalyticsService.getMerchantRevenue(
                restaurantId, period, startDate, endDate, allTime));
    }

    @GetMapping("/orders/status")
    @Operation(summary = "Get merchant order status summary")
    public ResponseEntity<DashboardStatsDTO.OrderStatusResponse> getMerchantOrderStatus(
            @Parameter(description = "Restaurant ID") @RequestParam UUID restaurantId,
            @Parameter(description = "Supported values: day, week, month") @RequestParam(defaultValue = "week")
                    String period,
            @Parameter(description = "Start date in format YYYY-MM-DD")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate startDate,
            @Parameter(description = "End date in format YYYY-MM-DD")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate endDate,
            @Parameter(description = "Use all records through today") @RequestParam(defaultValue = "false")
                    boolean allTime) {
        return ResponseEntity.ok(merchantDashboardAnalyticsService.getMerchantOrderStatus(
                restaurantId, period, startDate, endDate, allTime));
    }

    @GetMapping("/orders/live")
    @Operation(summary = "Get live merchant orders")
    public ResponseEntity<List<OrderSummaryDTO>> getMerchantLiveOrders(
            @Parameter(description = "Restaurant ID") @RequestParam UUID restaurantId) {
        return ResponseEntity.ok(merchantDashboardAnalyticsService.getMerchantLiveOrders(restaurantId));
    }

    @GetMapping("/top-products")
    @Operation(summary = "Get merchant top products")
    public ResponseEntity<DashboardStatsDTO.TopProductsResponse> getMerchantTopProducts(
            @Parameter(description = "Restaurant ID") @RequestParam UUID restaurantId,
            @Parameter(description = "Supported values: day, week, month") @RequestParam(defaultValue = "week")
                    String period,
            @Parameter(description = "Maximum number of products") @RequestParam(defaultValue = "5") int limit,
            @Parameter(description = "Start date in format YYYY-MM-DD")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate startDate,
            @Parameter(description = "End date in format YYYY-MM-DD")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate endDate,
            @Parameter(description = "Use all records through today") @RequestParam(defaultValue = "false")
                    boolean allTime) {
        return ResponseEntity.ok(merchantDashboardAnalyticsService.getMerchantTopProducts(
                restaurantId, period, limit, startDate, endDate, allTime));
    }
}
