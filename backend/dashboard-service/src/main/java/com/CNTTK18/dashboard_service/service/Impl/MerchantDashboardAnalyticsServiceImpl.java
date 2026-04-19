package com.CNTTK18.dashboard_service.service.Impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.client.OrderDashboardDataClient;
import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderSummaryDTO;
import com.CNTTK18.dashboard_service.exception.BadRequestException;
import com.CNTTK18.dashboard_service.model.OrderStatus;
import com.CNTTK18.dashboard_service.service.MerchantDashboardAnalyticsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MerchantDashboardAnalyticsServiceImpl implements MerchantDashboardAnalyticsService {
    private static final ZoneOffset UTC = ZoneOffset.UTC;

    private final OrderDashboardDataClient orderDashboardDataClient;

    @Override
    public DashboardStatsDTO.OverviewResponse getMerchantOverview(UUID restaurantId) {
        validateRestaurantId(restaurantId);

        DateRange dayRange = getRange("day");
        DateRange monthRange = getRange("month");

        long ordersToday = orderDashboardDataClient.countByRestaurantCreatedBetween(
                restaurantId, dayRange.start().toString(), dayRange.end().toString());
        long pendingOrders = orderDashboardDataClient.countByRestaurantStatus(restaurantId, OrderStatus.PENDING);
        long completedOrders = orderDashboardDataClient.countByRestaurantStatus(restaurantId, OrderStatus.COMPLETED);
        long cancelledOrders = orderDashboardDataClient.countByRestaurantStatus(restaurantId, OrderStatus.CANCELLED);

        BigDecimal revenueToday = getMerchantRevenue(restaurantId, "day").getTotalRevenue();
        BigDecimal revenueThisMonth = getMerchantRevenue(restaurantId, "month").getTotalRevenue();

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
    public DashboardStatsDTO.RevenueResponse getMerchantRevenue(UUID restaurantId, String period) {
        validateRestaurantId(restaurantId);
        DateRange range = getRange(period);

        List<DashboardStatsDTO.RevenueByDate> breakdown =
                orderDashboardDataClient
                        .revenueByDayByRestaurant(
                                restaurantId,
                                range.start().toString(),
                                range.end().toString())
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

    @Override
    public DashboardStatsDTO.OrderStatusResponse getMerchantOrderStatus(UUID restaurantId, String period) {
        validateRestaurantId(restaurantId);
        DateRange range = getRange(period);

        long pending = orderDashboardDataClient.countByRestaurantStatusBetween(
                restaurantId,
                OrderStatus.PENDING,
                range.start().toString(),
                range.end().toString());
        long confirmed = orderDashboardDataClient.countByRestaurantStatusBetween(
                restaurantId,
                OrderStatus.CONFIRMED,
                range.start().toString(),
                range.end().toString());
        long preparing = orderDashboardDataClient.countByRestaurantStatusBetween(
                restaurantId,
                OrderStatus.PREPARING,
                range.start().toString(),
                range.end().toString());
        long delivering = orderDashboardDataClient.countByRestaurantStatusBetween(
                restaurantId,
                OrderStatus.DELIVERING,
                range.start().toString(),
                range.end().toString());
        long completed = orderDashboardDataClient.countByRestaurantStatusBetween(
                restaurantId,
                OrderStatus.COMPLETED,
                range.start().toString(),
                range.end().toString());
        long cancelled = orderDashboardDataClient.countByRestaurantStatusBetween(
                restaurantId,
                OrderStatus.CANCELLED,
                range.start().toString(),
                range.end().toString());

        long total = orderDashboardDataClient.countByRestaurantCreatedBetween(
                restaurantId, range.start().toString(), range.end().toString());

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
    public DashboardStatsDTO.TopProductsResponse getMerchantTopProducts(UUID restaurantId, String period, int limit) {
        validateRestaurantId(restaurantId);
        int safeLimit = limit > 0 ? limit : 5;
        DateRange range = getRange(period);

        List<DashboardStatsDTO.TopProductItem> items = orderDashboardDataClient
                .topProductsByRestaurant(
                        restaurantId, range.start().toString(), range.end().toString(), safeLimit)
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
    public List<OrderSummaryDTO> getMerchantLiveOrders(UUID restaurantId) {
        validateRestaurantId(restaurantId);
        return orderDashboardDataClient.liveOrders(restaurantId);
    }

    private DateRange getRange(String period) {
        String normalizedPeriod = normalizePeriod(period);
        LocalDate today = LocalDate.now(UTC);

        return switch (normalizedPeriod) {
            case "day" -> createRange(today, today);
            case "week" -> createRange(today.minusDays(6), today);
            case "month" -> createRange(today.withDayOfMonth(1), today);
            default -> {
                log.error("Invalid period received: {}", period);
                throw new BadRequestException("period must be day, week or month");
            }
        };
    }

    private void validateRestaurantId(UUID restaurantId) {
        if (restaurantId == null) {
            throw new BadRequestException("restaurantId is required");
        }
    }

    private DateRange createRange(LocalDate startDate, LocalDate endDate) {
        Instant start = startDate.atStartOfDay(UTC).toInstant();
        Instant end = endDate.plusDays(1).atStartOfDay(UTC).minusNanos(1).toInstant();
        return new DateRange(start, end);
    }

    private String normalizePeriod(String period) {
        return Optional.ofNullable(period)
                .map(String::trim)
                .map(String::toLowerCase)
                .orElse("week");
    }

    private record DateRange(Instant start, Instant end) {}
}
