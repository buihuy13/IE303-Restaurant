package com.CNTTK18.dashboard_service.controller;

import java.util.concurrent.CompletableFuture;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.dashboard_service.dto.user.UserAdminStatsOverviewResponse;
import com.CNTTK18.dashboard_service.service.UserStatsAggregationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard/users/admin/stats")
@RequiredArgsConstructor
@Tag(name = "Dashboard User Stats", description = "Admin user statistics APIs")
public class UserAdminStatsController {
    private final UserStatsAggregationService userStatsAggregationService;

    @GetMapping("/overview")
    @Operation(summary = "Get admin user statistics overview")
    public CompletableFuture<ResponseEntity<UserAdminStatsOverviewResponse>> getAdminStatsOverview() {
        return userStatsAggregationService.getAdminStatsOverview().thenApply(ResponseEntity::ok);
    }
}
