package com.CNTTK18.dashboard_service.controller;

import java.util.concurrent.CompletableFuture;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantAdminStatsResponse;
import com.CNTTK18.dashboard_service.service.RestaurantStatsAggregationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard/restaurants/admin")
@RequiredArgsConstructor
@Tag(name = "Dashboard Restaurant Stats", description = "Admin restaurant statistics APIs")
public class RestaurantAdminStatsController {
    private final RestaurantStatsAggregationService restaurantStatsAggregationService;

    @GetMapping("/stats")
    @Operation(summary = "Get admin restaurant statistics")
    public CompletableFuture<ResponseEntity<RestaurantAdminStatsResponse>> getAdminStats() {
        return restaurantStatsAggregationService.getAdminStats().thenApply(ResponseEntity::ok);
    }
}
