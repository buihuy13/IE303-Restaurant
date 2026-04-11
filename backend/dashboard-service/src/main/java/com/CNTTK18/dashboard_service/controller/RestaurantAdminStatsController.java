package com.CNTTK18.dashboard_service.controller;

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
@RequestMapping("/api/restaurant/admin")
@RequiredArgsConstructor
@Tag(name = "Dashboard Restaurant Stats", description = "Admin restaurant statistics APIs")
public class RestaurantAdminStatsController {
    private final RestaurantStatsAggregationService restaurantStatsAggregationService;

    @GetMapping("/stats")
    @Operation(summary = "Get admin restaurant statistics")
    public ResponseEntity<RestaurantAdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(restaurantStatsAggregationService.getAdminStats());
    }
}
