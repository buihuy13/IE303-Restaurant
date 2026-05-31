package com.CNTTK18.dashboard_service.service.Impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.client.OrderDashboardDataClient;
import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderDataDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderResponse;
import com.CNTTK18.dashboard_service.exception.BadRequestException;
import com.CNTTK18.dashboard_service.model.OrderStatus;
import com.CNTTK18.dashboard_service.service.DashboardAnalyticsService;
import com.CNTTK18.dashboard_service.service.DashboardDateRangeResolver;
import com.CNTTK18.dashboard_service.service.DashboardDateRangeResolver.DateRange;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardAnalyticsServiceImpl implements DashboardAnalyticsService {
    private static final ZoneOffset UTC = ZoneOffset.UTC;

    private final OrderDashboardDataClient orderDashboardDataClient;

    @Override
    public DashboardStatsDTO.OverviewResponse getOverview() {
        DateRange dayRange = DashboardDateRangeResolver.resolve("day", null, null, false);
        DateRange monthRange = DashboardDateRangeResolver.resolve("month", null, null, false);

        long pendingOrders = orderDashboardDataClient.countByStatus(OrderStatus.PENDING);
        long completedOrders = orderDashboardDataClient.countByStatus(OrderStatus.COMPLETED);
        long cancelledOrders = orderDashboardDataClient.countByStatus(OrderStatus.CANCELLED);
        long ordersToday = orderDashboardDataClient.countByCreatedBetween(
                dayRange.start().toString(), dayRange.end().toString());

        BigDecimal revenueToday = buildRevenue(dayRange).getTotalRevenue();
        BigDecimal revenueThisMonth = buildRevenue(monthRange).getTotalRevenue();

        return DashboardStatsDTO.OverviewResponse.builder()
                .revenueToday(revenueToday)
                .revenueThisMonth(revenueThisMonth)
                .ordersToday(ordersToday)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .build();
    }

    @Override
    public DashboardStatsDTO.RevenueResponse getRevenue(
            String period, LocalDate startDate, LocalDate endDate, boolean allTime) {
        return buildRevenue(DashboardDateRangeResolver.resolve(period, startDate, endDate, allTime));
    }

    @Override
    public DashboardStatsDTO.RevenueCompareResponse getRevenueCompare(
            String period, LocalDate startDate, LocalDate endDate, boolean allTime) {
        DateRange currentRange = DashboardDateRangeResolver.resolve(period, startDate, endDate, allTime);
        DashboardStatsDTO.RevenueResponse current = buildRevenue(currentRange);

        if (currentRange.allTime()) {
            return DashboardStatsDTO.RevenueCompareResponse.builder()
                    .current(current)
                    .previous(emptyRevenue())
                    .revenueGrowthPercent(0D)
                    .orderGrowthPercent(0D)
                    .build();
        }

        DateRange previousRange;
        if (startDate != null && endDate != null) {
            previousRange = DashboardDateRangeResolver.previousSameLength(currentRange);
        } else {
            String normalizedPeriod = DashboardDateRangeResolver.normalizePeriod(period);
            if (!"week".equals(normalizedPeriod) && !"month".equals(normalizedPeriod)) {
                throw new BadRequestException("period must be week or month");
            }
            previousRange = DashboardDateRangeResolver.previousPeriod(normalizedPeriod);
        }

        DashboardStatsDTO.RevenueResponse previous = buildRevenue(previousRange);

        return DashboardStatsDTO.RevenueCompareResponse.builder()
                .current(current)
                .previous(previous)
                .revenueGrowthPercent(calculateGrowthPercent(current.getTotalRevenue(), previous.getTotalRevenue()))
                .orderGrowthPercent(calculateGrowthPercent(current.getTotalOrders(), previous.getTotalOrders()))
                .build();
    }

    @Override
    public DashboardStatsDTO.OrderStatusResponse getOrderStatusSummary(
            String period, LocalDate startDate, LocalDate endDate, boolean allTime) {
        DateRange range = DashboardDateRangeResolver.resolve(period, startDate, endDate, allTime);

        long pending = orderDashboardDataClient.countByStatusBetween(
                OrderStatus.PENDING, range.start().toString(), range.end().toString());
        long confirmed = orderDashboardDataClient.countByStatusBetween(
                OrderStatus.CONFIRMED, range.start().toString(), range.end().toString());
        long preparing = orderDashboardDataClient.countByStatusBetween(
                OrderStatus.PREPARING, range.start().toString(), range.end().toString());
        long delivering = orderDashboardDataClient.countByStatusBetween(
                OrderStatus.DELIVERING, range.start().toString(), range.end().toString());
        long completed = orderDashboardDataClient.countByStatusBetween(
                OrderStatus.COMPLETED, range.start().toString(), range.end().toString());
        long cancelled = orderDashboardDataClient.countByStatusBetween(
                OrderStatus.CANCELLED, range.start().toString(), range.end().toString());

        long total = orderDashboardDataClient.countByCreatedBetween(
                range.start().toString(), range.end().toString());

        return DashboardStatsDTO.OrderStatusResponse.builder()
                .total(total)
                .pending(pending)
                .confirmed(confirmed)
                .preparing(preparing)
                .delivering(delivering)
                .completed(completed)
                .cancelled(cancelled)
                .build();
    }

    @Override
    public List<DashboardStatsDTO.HourlyOrderResponse> getHourlyOrders(LocalDate date) {
        LocalDate normalizedDate = Optional.ofNullable(date).orElse(LocalDate.now(UTC));
        Instant start = normalizedDate.atStartOfDay(UTC).toInstant();
        Instant end = normalizedDate.plusDays(1).atStartOfDay(UTC).minusNanos(1).toInstant();

        Map<Integer, Long> hourToOrderCount =
                orderDashboardDataClient.hourlyOrders(start.toString(), end.toString()).stream()
                        .collect(Collectors.toMap(
                                projection -> Optional.ofNullable(projection.getHour())
                                        .orElse(0),
                                OrderDataDTO.HourlyOrderItem::getOrderCount,
                                Long::sum));

        List<DashboardStatsDTO.HourlyOrderResponse> responses = new ArrayList<>(24);
        for (int hour = 0; hour <= 23; hour++) {
            responses.add(DashboardStatsDTO.HourlyOrderResponse.builder()
                    .hour(hour)
                    .orderCount(hourToOrderCount.getOrDefault(hour, 0L))
                    .build());
        }

        return responses;
    }

    @Override
    public DashboardStatsDTO.TopProductsResponse getTopProducts(
            String period, int limit, LocalDate startDate, LocalDate endDate, boolean allTime) {
        int safeLimit = limit > 0 ? limit : 5;
        DateRange range = DashboardDateRangeResolver.resolve(period, startDate, endDate, allTime);

        List<DashboardStatsDTO.TopProductItem> items =
                orderDashboardDataClient
                        .topProducts(range.start().toString(), range.end().toString(), safeLimit)
                        .stream()
                        .map(projection -> DashboardStatsDTO.TopProductItem.builder()
                                .productId(projection.getProductId())
                                .productName(projection.getProductName())
                                .sizeName(projection.getSizeName())
                                .totalQuantitySold(projection.getTotalQuantitySold())
                                .totalRevenue(Optional.ofNullable(projection.getTotalRevenue())
                                        .orElse(BigDecimal.ZERO))
                                .build())
                        .toList();

        return DashboardStatsDTO.TopProductsResponse.builder().items(items).build();
    }

    @Override
    public DashboardStatsDTO.RevenueByRestaurantResponse getRevenueByRestaurant(
            String period, int limit, LocalDate startDate, LocalDate endDate, boolean allTime) {
        int safeLimit = limit > 0 ? limit : 10;
        DateRange range = DashboardDateRangeResolver.resolve(period, startDate, endDate, allTime);

        List<DashboardStatsDTO.RevenueByRestaurantItem> items =
                orderDashboardDataClient
                        .revenueByRestaurant(
                                range.start().toString(), range.end().toString(), safeLimit)
                        .stream()
                        .map(projection -> DashboardStatsDTO.RevenueByRestaurantItem.builder()
                                .restaurantId(projection.getRestaurantId())
                                .restaurantName(projection.getRestaurantName())
                                .revenue(Optional.ofNullable(projection.getRevenue())
                                        .orElse(BigDecimal.ZERO))
                                .orderCount(projection.getOrderCount())
                                .build())
                        .toList();

        return DashboardStatsDTO.RevenueByRestaurantResponse.builder()
                .items(items)
                .build();
    }

    @Override
    public List<OrderResponse> getRecentOrders(int limit) {
        int safeLimit = limit > 0 ? limit : 10;
        return orderDashboardDataClient.recentOrders(safeLimit);
    }

    private DashboardStatsDTO.RevenueResponse buildRevenue(DateRange range) {
        List<DashboardStatsDTO.RevenueByDate> breakdown =
                orderDashboardDataClient
                        .revenueByDay(range.start().toString(), range.end().toString())
                        .stream()
                        .map(projection -> DashboardStatsDTO.RevenueByDate.builder()
                                .date(projection.getDate())
                                .revenue(Optional.ofNullable(projection.getRevenue())
                                        .orElse(BigDecimal.ZERO))
                                .orderCount(projection.getOrderCount())
                                .build())
                        .sorted(Comparator.comparing(DashboardStatsDTO.RevenueByDate::getDate))
                        .toList();

        BigDecimal totalRevenue = breakdown.stream()
                .map(DashboardStatsDTO.RevenueByDate::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = breakdown.stream()
                .mapToLong(DashboardStatsDTO.RevenueByDate::getOrderCount)
                .sum();

        return DashboardStatsDTO.RevenueResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .breakdown(breakdown)
                .build();
    }

    private DashboardStatsDTO.RevenueResponse emptyRevenue() {
        return DashboardStatsDTO.RevenueResponse.builder()
                .totalRevenue(BigDecimal.ZERO)
                .totalOrders(0)
                .breakdown(List.of())
                .build();
    }

    private double calculateGrowthPercent(BigDecimal current, BigDecimal previous) {
        BigDecimal safeCurrent = Optional.ofNullable(current).orElse(BigDecimal.ZERO);
        BigDecimal safePrevious = Optional.ofNullable(previous).orElse(BigDecimal.ZERO);

        if (safePrevious.compareTo(BigDecimal.ZERO) == 0) {
            return safeCurrent.compareTo(BigDecimal.ZERO) == 0 ? 0D : 100D;
        }

        return safeCurrent
                .subtract(safePrevious)
                .multiply(BigDecimal.valueOf(100))
                .divide(safePrevious, 2, java.math.RoundingMode.HALF_UP)
                .doubleValue();
    }

    private double calculateGrowthPercent(long current, long previous) {
        if (previous == 0L) {
            return current == 0L ? 0D : 100D;
        }

        return BigDecimal.valueOf(current - previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(previous), 2, java.math.RoundingMode.HALF_UP)
                .doubleValue();
    }
}
