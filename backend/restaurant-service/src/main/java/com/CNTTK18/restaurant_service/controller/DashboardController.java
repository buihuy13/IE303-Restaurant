package com.CNTTK18.restaurant_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.restaurant_service.dto.dashboard.response.MerchantOverviewResponse;
import com.CNTTK18.restaurant_service.service.DashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Merchant Dashboard APIs")
public class DashboardController {
    private DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Tag(name = "Get")
    @Operation(summary = "Get merchant restaurant information and statistics")
    @GetMapping("/merchant/{merchantId}/restaurant")
    public ResponseEntity<MerchantOverviewResponse> getMerchantOverview(
            @PathVariable String merchantId, @AuthenticationPrincipal String userId) {
        MerchantOverviewResponse overview = dashboardService.getMerchantOverview(merchantId, userId);
        return ResponseEntity.ok(overview);
    }
}
