package com.CNTTK18.dashboard_service.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.client.UserDashboardDataClient;
import com.CNTTK18.dashboard_service.dto.user.UserAdminStatsOverviewResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserStatsAggregationService {
    private static final ZoneOffset UTC = ZoneOffset.UTC;

    private final UserDashboardDataClient userDashboardDataClient;

    public UserAdminStatsOverviewResponse getAdminStatsOverview() {
        LocalDateTime nowUtc = LocalDateTime.now(UTC);
        LocalDate todayUtc = nowUtc.toLocalDate();

        LocalDateTime startToday = todayUtc.atStartOfDay();
        LocalDateTime startWeek = todayUtc.minusDays(6).atStartOfDay();
        LocalDateTime startMonth = todayUtc.withDayOfMonth(1).atStartOfDay();

        return UserAdminStatsOverviewResponse.builder()
                .totalUsers(userDashboardDataClient.countUsers())
                .newUsersToday(userDashboardDataClient.countUsersByCreatedBetween(
                        startToday.toInstant(UTC).toString(), nowUtc.toInstant(UTC).toString()))
                .newUsersThisWeek(userDashboardDataClient.countUsersByCreatedBetween(
                        startWeek.toInstant(UTC).toString(), nowUtc.toInstant(UTC).toString()))
                .newUsersThisMonth(userDashboardDataClient.countUsersByCreatedBetween(
                        startMonth.toInstant(UTC).toString(), nowUtc.toInstant(UTC).toString()))
                .build();
    }
}
