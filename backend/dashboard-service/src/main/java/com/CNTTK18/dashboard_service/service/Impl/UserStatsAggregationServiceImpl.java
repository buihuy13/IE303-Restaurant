package com.CNTTK18.dashboard_service.service.Impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.client.UserDashboardDataClient;
import com.CNTTK18.dashboard_service.dto.user.UserAdminStatsOverviewResponse;
import com.CNTTK18.dashboard_service.service.UserStatsAggregationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserStatsAggregationServiceImpl implements UserStatsAggregationService {
    private static final ZoneOffset UTC = ZoneOffset.UTC;

    private final UserDashboardDataClient userDashboardDataClient;
    private final Executor dashboardExecutor;

    @Override
    @Cacheable(value = "user-stats", key = "'admin'")
    public CompletableFuture<UserAdminStatsOverviewResponse> getAdminStatsOverview() {
        LocalDateTime nowUtc = LocalDateTime.now(UTC);
        LocalDate todayUtc = nowUtc.toLocalDate();

        LocalDateTime startToday = todayUtc.atStartOfDay();
        LocalDateTime startWeek = todayUtc.minusDays(6).atStartOfDay();
        LocalDateTime startMonth = todayUtc.withDayOfMonth(1).atStartOfDay();

        CompletableFuture<Long> totalUsers = supplyAsync(() -> userDashboardDataClient.countUsers());
        CompletableFuture<Long> newUsersToday = supplyAsync(() -> userDashboardDataClient.countUsersByCreatedBetween(
                startToday.toInstant(UTC).toString(), nowUtc.toInstant(UTC).toString()));
        CompletableFuture<Long> newUsersThisWeek = supplyAsync(() -> userDashboardDataClient.countUsersByCreatedBetween(
                startWeek.toInstant(UTC).toString(), nowUtc.toInstant(UTC).toString()));
        CompletableFuture<Long> newUsersThisMonth =
                supplyAsync(() -> userDashboardDataClient.countUsersByCreatedBetween(
                        startMonth.toInstant(UTC).toString(),
                        nowUtc.toInstant(UTC).toString()));

        return CompletableFuture.allOf(totalUsers, newUsersToday, newUsersThisWeek, newUsersThisMonth)
                .thenApply(voidResult -> UserAdminStatsOverviewResponse.builder()
                        .totalUsers(totalUsers.join())
                        .newUsersToday(newUsersToday.join())
                        .newUsersThisWeek(newUsersThisWeek.join())
                        .newUsersThisMonth(newUsersThisMonth.join())
                        .build());
    }

    private <T> CompletableFuture<T> supplyAsync(java.util.function.Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(supplier, dashboardExecutor);
    }
}
