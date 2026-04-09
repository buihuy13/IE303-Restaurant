package com.CNTTK18.order_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.order_service.client.RestaurantClient;
import com.CNTTK18.order_service.dto.UserRole;
import com.CNTTK18.order_service.dto.client.ResClientResponse;
import com.CNTTK18.order_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.order_service.dto.order.response.OrderSummaryDTO;
import com.CNTTK18.order_service.exception.ForbiddenException;
import com.CNTTK18.order_service.service.MerchantDashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/merchant/dashboard")
@RequiredArgsConstructor
@Tag(name = "Merchant Dashboard", description = "Merchant dashboard analytics APIs")
@Slf4j
public class MerchantDashboardController {
    private final MerchantDashboardService merchantDashboardService;
    private final RestaurantClient restaurantClient;

    @GetMapping("/overview")
    @Operation(summary = "Get merchant overview metrics")
    public ResponseEntity<DashboardStatsDTO.OverviewResponse> getMerchantOverview(
            @Parameter(description = "Restaurant ID") @RequestParam UUID restaurantId) {
        requireMerchantOrAdminAccess(restaurantId);
        return ResponseEntity.ok(merchantDashboardService.getMerchantOverview(restaurantId));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get merchant revenue by period")
    public ResponseEntity<DashboardStatsDTO.RevenueResponse> getMerchantRevenue(
            @Parameter(description = "Restaurant ID") @RequestParam UUID restaurantId,
            @Parameter(description = "Supported values: day, week, month") @RequestParam(defaultValue = "week")
                    String period) {
        requireMerchantOrAdminAccess(restaurantId);
        return ResponseEntity.ok(merchantDashboardService.getMerchantRevenue(restaurantId, period));
    }

    @GetMapping("/orders/status")
    @Operation(summary = "Get merchant order status summary")
    public ResponseEntity<DashboardStatsDTO.OrderStatusResponse> getMerchantOrderStatus(
            @Parameter(description = "Restaurant ID") @RequestParam UUID restaurantId,
            @Parameter(description = "Supported values: day, week, month") @RequestParam(defaultValue = "week")
                    String period) {
        requireMerchantOrAdminAccess(restaurantId);
        return ResponseEntity.ok(merchantDashboardService.getMerchantOrderStatus(restaurantId, period));
    }

    @GetMapping("/orders/live")
    @Operation(summary = "Get live merchant orders")
    public ResponseEntity<List<OrderSummaryDTO>> getMerchantLiveOrders(
            @Parameter(description = "Restaurant ID") @RequestParam UUID restaurantId) {
        requireMerchantOrAdminAccess(restaurantId);
        return ResponseEntity.ok(merchantDashboardService.getMerchantLiveOrders(restaurantId));
    }

    @GetMapping("/top-products")
    @Operation(summary = "Get merchant top products")
    public ResponseEntity<DashboardStatsDTO.TopProductsResponse> getMerchantTopProducts(
            @Parameter(description = "Restaurant ID") @RequestParam UUID restaurantId,
            @Parameter(description = "Supported values: day, week, month") @RequestParam(defaultValue = "week")
                    String period,
            @Parameter(description = "Maximum number of products") @RequestParam(defaultValue = "5") int limit) {
        requireMerchantOrAdminAccess(restaurantId);
        return ResponseEntity.ok(merchantDashboardService.getMerchantTopProducts(restaurantId, period, limit));
    }

    private void requireMerchantOrAdminAccess(UUID restaurantId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication != null ? authentication.getPrincipal() : null;

        if (!(principal instanceof UserRole userRole)) {
            log.error("Missing user role principal in SecurityContext");
            throw new ForbiddenException("Access denied");
        }

        String role = userRole.getRole();
        if ("ADMIN".equals(role)) {
            return;
        }

        if (!"MERCHANT".equals(role)) {
            log.error("Access denied for role: {}", role);
            throw new ForbiddenException("Access denied");
        }

        try {
            ResClientResponse merchantRestaurant =
                    restaurantClient.getRestaurantByMerchantId(userRole.getId()).block();
            if (merchantRestaurant == null
                    || merchantRestaurant.getId() == null
                    || !merchantRestaurant.getId().equals(restaurantId)) {
                throw new ForbiddenException("Access denied");
            }
        } catch (ForbiddenException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error(
                    "Cannot validate merchant restaurant ownership for user {} and restaurant {}",
                    userRole.getId(),
                    restaurantId,
                    ex);
            throw new ForbiddenException("Access denied");
        }
    }
}
