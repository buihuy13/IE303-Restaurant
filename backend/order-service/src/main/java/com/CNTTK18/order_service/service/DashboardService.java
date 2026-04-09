package com.CNTTK18.order_service.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.CNTTK18.order_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.order_service.dto.order.response.OrderResponse;
import com.CNTTK18.order_service.exception.BadRequestException;
import com.CNTTK18.order_service.mapper.OrderMapper;
import com.CNTTK18.order_service.model.Order;
import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.repository.OrderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {
    private static final ZoneOffset UTC = ZoneOffset.UTC;

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    public DashboardStatsDTO.OverviewResponse getOverview() {
        DateRange dayRange = getRange("day");
        DateRange monthRange = getRange("month");

        CompletableFuture<Long> pendingFuture =
                CompletableFuture.supplyAsync(() -> orderRepository.countByStatus(OrderStatus.PENDING));
        CompletableFuture<Long> completedFuture =
                CompletableFuture.supplyAsync(() -> orderRepository.countByStatus(OrderStatus.COMPLETED));
        CompletableFuture<Long> cancelledFuture =
                CompletableFuture.supplyAsync(() -> orderRepository.countByStatus(OrderStatus.CANCELLED));

        CompletableFuture<Long> ordersTodayFuture =
                CompletableFuture.supplyAsync(() -> orderRepository.countByCreatedAtBetween(dayRange.start(), dayRange.end()));

        CompletableFuture<BigDecimal> revenueTodayFuture = CompletableFuture.supplyAsync(() -> sumRevenue(
                orderRepository.findCompletedOrdersBetween(dayRange.start(), dayRange.end())));
        CompletableFuture<BigDecimal> revenueMonthFuture = CompletableFuture.supplyAsync(() -> sumRevenue(
                orderRepository.findCompletedOrdersBetween(monthRange.start(), monthRange.end())));

        return DashboardStatsDTO.OverviewResponse.builder()
                .revenueToday(revenueTodayFuture.join())
                .revenueThisMonth(revenueMonthFuture.join())
                .ordersToday(ordersTodayFuture.join())
                .pendingOrders(pendingFuture.join())
                .completedOrders(completedFuture.join())
                .cancelledOrders(cancelledFuture.join())
                .build();
    }

    public DashboardStatsDTO.RevenueResponse getRevenue(String period) {
        return buildRevenue(getRange(period));
    }

    public DashboardStatsDTO.RevenueCompareResponse getRevenueCompare(String period) {
        String normalizedPeriod = normalizePeriod(period);
        if (!"week".equals(normalizedPeriod) && !"month".equals(normalizedPeriod)) {
            throw new BadRequestException("period must be week or month");
        }

        DashboardStatsDTO.RevenueResponse current = buildRevenue(getRange(normalizedPeriod));
        DashboardStatsDTO.RevenueResponse previous = buildRevenue(getPreviousRange(normalizedPeriod));

        return DashboardStatsDTO.RevenueCompareResponse.builder()
                .current(current)
                .previous(previous)
                .revenueGrowthPercent(calculateGrowthPercent(current.getTotalRevenue(), previous.getTotalRevenue()))
                .orderGrowthPercent(calculateGrowthPercent(current.getTotalOrders(), previous.getTotalOrders()))
                .build();
    }

    public DashboardStatsDTO.OrderStatusResponse getOrderStatusSummary(String period) {
        DateRange range = getRange(period);

        long pending = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.PENDING, range.start(), range.end());
        long confirmed =
                orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.CONFIRMED, range.start(), range.end());
        long preparing =
                orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.PREPARING, range.start(), range.end());
        long delivering =
                orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.DELIVERING, range.start(), range.end());
        long completed =
                orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.COMPLETED, range.start(), range.end());
        long cancelled =
                orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.CANCELLED, range.start(), range.end());

        return DashboardStatsDTO.OrderStatusResponse.builder()
                .total(orderRepository.countByCreatedAtBetween(range.start(), range.end()))
                .pending(pending)
                .confirmed(confirmed)
                .preparing(preparing)
                .delivering(delivering)
                .completed(completed)
                .cancelled(cancelled)
                .build();
    }

    public List<DashboardStatsDTO.HourlyOrderResponse> getHourlyOrders(LocalDate date) {
        LocalDate normalizedDate = Optional.ofNullable(date).orElse(LocalDate.now(UTC));
        Instant start = normalizedDate.atStartOfDay(UTC).toInstant();
        Instant end = normalizedDate.plusDays(1).atStartOfDay(UTC).minusNanos(1).toInstant();

        Map<Integer, Long> hourToOrderCount = orderRepository.aggregateHourlyOrders(start, end).stream()
                .collect(Collectors.toMap(
                        projection -> Optional.ofNullable(projection.getHour()).orElse(0),
                        OrderRepository.HourlyOrderProjection::getOrderCount,
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

    public DashboardStatsDTO.TopProductsResponse getTopProducts(String period, int limit) {
        int safeLimit = limit > 0 ? limit : 5;
        DateRange range = getRange(period);

        List<DashboardStatsDTO.TopProductItem> items = orderRepository
                .aggregateTopProducts(range.start(), range.end(), safeLimit)
                .stream()
                .map(projection -> DashboardStatsDTO.TopProductItem.builder()
                        .productId(projection.getProductId())
                        .productName(projection.getProductName())
                        .sizeName(projection.getSizeName())
                        .totalQuantitySold(projection.getTotalQuantitySold())
                        .totalRevenue(Optional.ofNullable(projection.getTotalRevenue()).orElse(BigDecimal.ZERO))
                        .build())
                .toList();

        return DashboardStatsDTO.TopProductsResponse.builder().items(items).build();
    }

    public DashboardStatsDTO.RevenueByRestaurantResponse getRevenueByRestaurant(String period, int limit) {
        int safeLimit = limit > 0 ? limit : 10;
        DateRange range = getRange(period);

        List<DashboardStatsDTO.RevenueByRestaurantItem> items = orderRepository
                .aggregateRevenueByRestaurant(range.start(), range.end(), safeLimit)
                .stream()
                .map(projection -> DashboardStatsDTO.RevenueByRestaurantItem.builder()
                        .restaurantId(projection.getRestaurantId())
                        .restaurantName(projection.getRestaurantName())
                        .revenue(Optional.ofNullable(projection.getRevenue()).orElse(BigDecimal.ZERO))
                        .orderCount(projection.getOrderCount())
                        .build())
                .toList();

        return DashboardStatsDTO.RevenueByRestaurantResponse.builder().items(items).build();
    }

    public List<OrderResponse> getRecentOrders(int limit) {
        int safeLimit = limit > 0 ? limit : 10;
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit));
        return orderMapper.toResponseList(orders);
    }

    public DateRange getRange(String period) {
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

    private DateRange getPreviousRange(String period) {
        String normalizedPeriod = normalizePeriod(period);
        LocalDate today = LocalDate.now(UTC);

        return switch (normalizedPeriod) {
            case "day" -> {
                LocalDate yesterday = today.minusDays(1);
                yield createRange(yesterday, yesterday);
            }
            case "week" -> {
                LocalDate previousEnd = today.minusDays(7);
                LocalDate previousStart = previousEnd.minusDays(6);
                yield createRange(previousStart, previousEnd);
            }
            case "month" -> {
                YearMonth previousMonth = YearMonth.now(UTC).minusMonths(1);
                yield createRange(previousMonth.atDay(1), previousMonth.atEndOfMonth());
            }
            default -> {
                log.error("Invalid period for compare: {}", period);
                throw new BadRequestException("period must be day, week or month");
            }
        };
    }

    private DashboardStatsDTO.RevenueResponse buildRevenue(DateRange range) {
        List<DashboardStatsDTO.RevenueByDate> breakdown = orderRepository
                .aggregateRevenueByDay(range.start(), range.end())
                .stream()
                .map(projection -> DashboardStatsDTO.RevenueByDate.builder()
                        .date(projection.getDate())
                        .revenue(Optional.ofNullable(projection.getRevenue()).orElse(BigDecimal.ZERO))
                        .orderCount(projection.getOrderCount())
                        .build())
                .sorted(Comparator.comparing(DashboardStatsDTO.RevenueByDate::getDate))
                .toList();

        BigDecimal totalRevenue = breakdown.stream()
                .map(DashboardStatsDTO.RevenueByDate::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = breakdown.stream().mapToLong(DashboardStatsDTO.RevenueByDate::getOrderCount).sum();

        return DashboardStatsDTO.RevenueResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .breakdown(breakdown)
                .build();
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

    private BigDecimal sumRevenue(List<Order> orders) {
        return Optional.ofNullable(orders)
                .orElseGet(List::of)
                .stream()
                .map(Order::getTotalPrice)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private double calculateGrowthPercent(BigDecimal current, BigDecimal previous) {
        BigDecimal safeCurrent = Optional.ofNullable(current).orElse(BigDecimal.ZERO);
        BigDecimal safePrevious = Optional.ofNullable(previous).orElse(BigDecimal.ZERO);

        if (safePrevious.compareTo(BigDecimal.ZERO) == 0) {
            return safeCurrent.compareTo(BigDecimal.ZERO) == 0 ? 0D : 100D;
        }

        return safeCurrent.subtract(safePrevious)
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

    public record DateRange(Instant start, Instant end) {}
}
