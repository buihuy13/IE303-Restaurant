package com.CNTTK18.dashboard_service.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.CNTTK18.dashboard_service.exception.BadRequestException;

class DashboardDateRangeResolverTest {
    private static final LocalDate TODAY = LocalDate.of(2026, 5, 30);

    @Test
    void explicitRangeUsesInclusiveUtcDayBoundaries() {
        DashboardDateRangeResolver.DateRange range = DashboardDateRangeResolver.resolve(
                "month", LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 30), false, TODAY);

        assertThat(range.startDate()).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(range.endDate()).isEqualTo(LocalDate.of(2026, 5, 30));
        assertThat(range.start()).isEqualTo(Instant.parse("2026-05-01T00:00:00Z"));
        assertThat(range.end()).isEqualTo(Instant.parse("2026-05-30T23:59:59.999999999Z"));
        assertThat(range.allTime()).isFalse();
    }

    @Test
    void allTimeStartsAtEpochDateAndEndsToday() {
        DashboardDateRangeResolver.DateRange range =
                DashboardDateRangeResolver.resolve("week", null, null, true, TODAY);

        assertThat(range.startDate()).isEqualTo(LocalDate.of(1970, 1, 1));
        assertThat(range.endDate()).isEqualTo(TODAY);
        assertThat(range.start()).isEqualTo(Instant.parse("1970-01-01T00:00:00Z"));
        assertThat(range.end()).isEqualTo(Instant.parse("2026-05-30T23:59:59.999999999Z"));
        assertThat(range.allTime()).isTrue();
    }

    @Test
    void rejectsPartialExplicitRange() {
        assertThatThrownBy(
                        () -> DashboardDateRangeResolver.resolve("week", LocalDate.of(2026, 5, 1), null, false, TODAY))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("startDate and endDate");
    }

    @Test
    void rejectsStartDateAfterEndDate() {
        assertThatThrownBy(() -> DashboardDateRangeResolver.resolve(
                        "week", LocalDate.of(2026, 5, 30), LocalDate.of(2026, 5, 1), false, TODAY))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("startDate cannot be after endDate");
    }

    @Test
    void previousSameLengthUsesImmediatelyPrecedingInclusiveWindow() {
        DashboardDateRangeResolver.DateRange current = DashboardDateRangeResolver.resolve(
                "week", LocalDate.of(2026, 5, 10), LocalDate.of(2026, 5, 16), false, TODAY);

        DashboardDateRangeResolver.DateRange previous = DashboardDateRangeResolver.previousSameLength(current);

        assertThat(previous.startDate()).isEqualTo(LocalDate.of(2026, 5, 3));
        assertThat(previous.endDate()).isEqualTo(LocalDate.of(2026, 5, 9));
        assertThat(previous.start()).isEqualTo(Instant.parse("2026-05-03T00:00:00Z"));
        assertThat(previous.end()).isEqualTo(Instant.parse("2026-05-09T23:59:59.999999999Z"));
    }

    @Test
    void fallbackMonthStillMeansCalendarMonthToDate() {
        DashboardDateRangeResolver.DateRange range =
                DashboardDateRangeResolver.resolve("month", null, null, false, TODAY);

        assertThat(range.startDate()).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(range.endDate()).isEqualTo(TODAY);
    }
}
