package com.CNTTK18.order_service.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.CNTTK18.order_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.order_service.dto.order.response.OrderSummaryDTO;
import com.CNTTK18.order_service.exception.BadRequestException;
import com.CNTTK18.order_service.model.Order;
import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.repository.OrderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MerchantDashboardService {
    private static final ZoneOffset UTC = ZoneOffset.UTC;

    private final OrderRepository orderRepository;

    public DashboardStatsDTO.OverviewResponse getMerchantOverview(UUID restaurantId) {
        validateRestaurantId(restaurantId);

        DateRange dayRange = getRange("day");
        DateRange monthRange = getRange("month");

        long ordersToday =
                orderRepository.countByRestaurantIdAndCreatedAtBetween(restaurantId, dayRange.start(), dayRange.end());
        long pendingOrders = orderRepository.countByRestaurantIdAndStatus(restaurantId, OrderStatus.PENDING);
        long completedOrders = orderRepository.countByRestaurantIdAndStatus(restaurantId, OrderStatus.COMPLETED);
        long cancelledOrders = orderRepository.countByRestaurantIdAndStatus(restaurantId, OrderStatus.CANCELLED);

        BigDecimal revenueToday = sumRevenue(orderRepository.findCompletedOrdersByRestaurantIdBetween(
                restaurantId, dayRange.start(), dayRange.end()));
        BigDecimal revenueThisMonth = sumRevenue(orderRepository.findCompletedOrdersByRestaurantIdBetween(
                restaurantId, monthRange.start(), monthRange.end()));

        return DashboardStatsDTO.OverviewResponse.builder()
                .revenueToday(revenueToday)
                .revenueThisMonth(revenueThisMonth)
                .ordersToday(ordersToday)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .build();
    }

    public DashboardStatsDTO.RevenueResponse getMerchantRevenue(UUID restaurantId, String period) {
        validateRestaurantId(restaurantId);
        DateRange range = getRange(period);

        List<DashboardStatsDTO.RevenueByDate> breakdown =
                orderRepository.aggregateRevenueByDayByRestaurant(restaurantId, range.start(), range.end()).stream()
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

    public DashboardStatsDTO.OrderStatusResponse getMerchantOrderStatus(UUID restaurantId, String period) {
        validateRestaurantId(restaurantId);
        DateRange range = getRange(period);

        long pending = orderRepository.countByRestaurantIdAndStatusAndCreatedAtBetween(
                restaurantId, OrderStatus.PENDING, range.start(), range.end());
        long confirmed = orderRepository.countByRestaurantIdAndStatusAndCreatedAtBetween(
                restaurantId, OrderStatus.CONFIRMED, range.start(), range.end());
        long preparing = orderRepository.countByRestaurantIdAndStatusAndCreatedAtBetween(
                restaurantId, OrderStatus.PREPARING, range.start(), range.end());
        long delivering = orderRepository.countByRestaurantIdAndStatusAndCreatedAtBetween(
                restaurantId, OrderStatus.DELIVERING, range.start(), range.end());
        long completed = orderRepository.countByRestaurantIdAndStatusAndCreatedAtBetween(
                restaurantId, OrderStatus.COMPLETED, range.start(), range.end());
        long cancelled = orderRepository.countByRestaurantIdAndStatusAndCreatedAtBetween(
                restaurantId, OrderStatus.CANCELLED, range.start(), range.end());

        return DashboardStatsDTO.OrderStatusResponse.builder()
                .total(orderRepository.countByRestaurantIdAndCreatedAtBetween(restaurantId, range.start(), range.end()))
                .pending(pending)
                .confirmed(confirmed)
                .preparing(preparing)
                .delivering(delivering)
                .completed(completed)
                .cancelled(cancelled)
                .build();
    }

    public DashboardStatsDTO.TopProductsResponse getMerchantTopProducts(UUID restaurantId, String period, int limit) {
        validateRestaurantId(restaurantId);
        int safeLimit = limit > 0 ? limit : 5;
        DateRange range = getRange(period);

        List<DashboardStatsDTO.TopProductItem> items =
                orderRepository
                        .aggregateTopProductsByRestaurant(restaurantId, range.start(), range.end(), safeLimit)
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

    public List<OrderSummaryDTO> getMerchantLiveOrders(UUID restaurantId) {
        validateRestaurantId(restaurantId);

        List<OrderStatus> statuses = List.of(OrderStatus.PENDING, OrderStatus.CONFIRMED);
        return orderRepository.findByRestaurantIdAndStatusInOrderByCreatedAtAsc(restaurantId, statuses).stream()
                .map(this::toSummary)
                .toList();
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

    private BigDecimal sumRevenue(List<Order> orders) {
        return Optional.ofNullable(orders).orElseGet(List::of).stream()
                .map(Order::getTotalPrice)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private OrderSummaryDTO toSummary(Order order) {
        return OrderSummaryDTO.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUserId())
                .restaurantId(order.getRestaurantId())
                .restaurantName(order.getRestaurantName())
                .totalPrice(Optional.ofNullable(order.getTotalPrice()).orElse(BigDecimal.ZERO))
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .createdAt(order.getCreatedAt())
                .itemCount(order.getItems() == null ? 0 : order.getItems().size())
                .build();
    }

    public record DateRange(Instant start, Instant end) {}
}
