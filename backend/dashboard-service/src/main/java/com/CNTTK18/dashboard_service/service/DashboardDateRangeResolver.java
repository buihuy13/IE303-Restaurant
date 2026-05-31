package com.CNTTK18.dashboard_service.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import com.CNTTK18.dashboard_service.exception.BadRequestException;

public final class DashboardDateRangeResolver {
    private static final ZoneOffset UTC = ZoneOffset.UTC;
    private static final LocalDate ALL_TIME_START_DATE = LocalDate.of(1970, 1, 1);

    private DashboardDateRangeResolver() {}

    public static DateRange resolve(String period, LocalDate startDate, LocalDate endDate, boolean allTime) {
        return resolve(period, startDate, endDate, allTime, LocalDate.now(UTC));
    }

    static DateRange resolve(String period, LocalDate startDate, LocalDate endDate, boolean allTime, LocalDate today) {
        boolean hasStartDate = startDate != null;
        boolean hasEndDate = endDate != null;

        if (hasStartDate != hasEndDate) {
            throw new BadRequestException("startDate and endDate must be provided together");
        }

        if (hasStartDate && startDate.isAfter(endDate)) {
            throw new BadRequestException("startDate cannot be after endDate");
        }

        if (allTime) {
            return createRange(ALL_TIME_START_DATE, today, true);
        }

        if (hasStartDate) {
            return createRange(startDate, endDate, false);
        }

        return switch (normalizePeriod(period)) {
            case "day" -> createRange(today, today, false);
            case "week" -> createRange(today.minusDays(6), today, false);
            case "month" -> createRange(today.withDayOfMonth(1), today, false);
            default -> throw new BadRequestException("period must be day, week or month");
        };
    }

    public static DateRange previousSameLength(DateRange current) {
        long inclusiveDays = ChronoUnit.DAYS.between(current.startDate(), current.endDate()) + 1;
        LocalDate previousEnd = current.startDate().minusDays(1);
        LocalDate previousStart = previousEnd.minusDays(inclusiveDays - 1);
        return createRange(previousStart, previousEnd, false);
    }

    public static DateRange previousPeriod(String period) {
        return previousPeriod(period, LocalDate.now(UTC));
    }

    static DateRange previousPeriod(String period, LocalDate today) {
        return switch (normalizePeriod(period)) {
            case "day" -> {
                LocalDate yesterday = today.minusDays(1);
                yield createRange(yesterday, yesterday, false);
            }
            case "week" -> {
                LocalDate previousEnd = today.minusDays(7);
                yield createRange(previousEnd.minusDays(6), previousEnd, false);
            }
            case "month" -> {
                YearMonth previousMonth = YearMonth.from(today).minusMonths(1);
                yield createRange(previousMonth.atDay(1), previousMonth.atEndOfMonth(), false);
            }
            default -> throw new BadRequestException("period must be day, week or month");
        };
    }

    public static String normalizePeriod(String period) {
        return Optional.ofNullable(period)
                .map(String::trim)
                .map(String::toLowerCase)
                .orElse("week");
    }

    private static DateRange createRange(LocalDate startDate, LocalDate endDate, boolean allTime) {
        Instant start = startDate.atStartOfDay(UTC).toInstant();
        Instant end = endDate.plusDays(1).atStartOfDay(UTC).minusNanos(1).toInstant();
        return new DateRange(startDate, endDate, start, end, allTime);
    }

    public record DateRange(LocalDate startDate, LocalDate endDate, Instant start, Instant end, boolean allTime) {}
}
