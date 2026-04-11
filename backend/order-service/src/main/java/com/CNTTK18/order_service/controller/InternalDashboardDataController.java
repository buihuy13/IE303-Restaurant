package com.CNTTK18.order_service.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.order_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.order_service.dto.order.response.OrderResponse;
import com.CNTTK18.order_service.dto.order.response.OrderSummaryDTO;
import com.CNTTK18.order_service.exception.BadRequestException;
import com.CNTTK18.order_service.mapper.OrderMapper;
import com.CNTTK18.order_service.model.Order;
import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/dashboard/order-data")
@RequiredArgsConstructor
public class InternalDashboardDataController {
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    @GetMapping("/count-by-status")
    public ResponseEntity<Long> countByStatus(@RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderRepository.countByStatus(status));
    }

    @GetMapping("/count-by-created-between")
    public ResponseEntity<Long> countByCreatedBetween(@RequestParam String start, @RequestParam String end) {
        return ResponseEntity.ok(orderRepository.countByCreatedAtBetween(parseInstant(start), parseInstant(end)));
    }

    @GetMapping("/count-by-status-between")
    public ResponseEntity<Long> countByStatusBetween(
            @RequestParam OrderStatus status, @RequestParam String start, @RequestParam String end) {
        return ResponseEntity.ok(orderRepository.countByStatusAndCreatedAtBetween(status, parseInstant(start), parseInstant(end)));
    }

    @GetMapping("/count-by-restaurant-status")
    public ResponseEntity<Long> countByRestaurantStatus(@RequestParam UUID restaurantId, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderRepository.countByRestaurantIdAndStatus(restaurantId, status));
    }

    @GetMapping("/count-by-restaurant-created-between")
    public ResponseEntity<Long> countByRestaurantCreatedBetween(
            @RequestParam UUID restaurantId, @RequestParam String start, @RequestParam String end) {
        return ResponseEntity.ok(orderRepository.countByRestaurantIdAndCreatedAtBetween(
                restaurantId, parseInstant(start), parseInstant(end)));
    }

    @GetMapping("/count-by-restaurant-status-between")
    public ResponseEntity<Long> countByRestaurantStatusBetween(
            @RequestParam UUID restaurantId,
            @RequestParam OrderStatus status,
            @RequestParam String start,
            @RequestParam String end) {
        return ResponseEntity.ok(orderRepository.countByRestaurantIdAndStatusAndCreatedAtBetween(
                restaurantId, status, parseInstant(start), parseInstant(end)));
    }

    @GetMapping("/revenue-by-day")
    public ResponseEntity<List<DashboardStatsDTO.RevenueByDate>> revenueByDay(
            @RequestParam String start, @RequestParam String end) {
        Instant startInstant = parseInstant(start);
        Instant endInstant = parseInstant(end);

        List<DashboardStatsDTO.RevenueByDate> result = orderRepository.aggregateRevenueByDay(startInstant, endInstant).stream()
                .map(projection -> DashboardStatsDTO.RevenueByDate.builder()
                        .date(projection.getDate())
                        .revenue(Optional.ofNullable(projection.getRevenue()).orElse(BigDecimal.ZERO))
                        .orderCount(projection.getOrderCount())
                        .build())
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/revenue-by-day-by-restaurant")
    public ResponseEntity<List<DashboardStatsDTO.RevenueByDate>> revenueByDayByRestaurant(
            @RequestParam UUID restaurantId, @RequestParam String start, @RequestParam String end) {
        Instant startInstant = parseInstant(start);
        Instant endInstant = parseInstant(end);

        List<DashboardStatsDTO.RevenueByDate> result = orderRepository
                .aggregateRevenueByDayByRestaurant(restaurantId, startInstant, endInstant)
                .stream()
                .map(projection -> DashboardStatsDTO.RevenueByDate.builder()
                        .date(projection.getDate())
                        .revenue(Optional.ofNullable(projection.getRevenue()).orElse(BigDecimal.ZERO))
                        .orderCount(projection.getOrderCount())
                        .build())
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<DashboardStatsDTO.TopProductItem>> topProducts(
            @RequestParam String start, @RequestParam String end, @RequestParam(defaultValue = "5") int limit) {
        Instant startInstant = parseInstant(start);
        Instant endInstant = parseInstant(end);
        int safeLimit = normalizeLimit(limit, 5);

        List<DashboardStatsDTO.TopProductItem> result = orderRepository
                .aggregateTopProducts(startInstant, endInstant, safeLimit)
                .stream()
                .map(projection -> DashboardStatsDTO.TopProductItem.builder()
                        .productId(projection.getProductId())
                        .productName(projection.getProductName())
                        .sizeName(projection.getSizeName())
                        .totalQuantitySold(projection.getTotalQuantitySold())
                        .totalRevenue(Optional.ofNullable(projection.getTotalRevenue()).orElse(BigDecimal.ZERO))
                        .build())
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/top-products-by-restaurant")
    public ResponseEntity<List<DashboardStatsDTO.TopProductItem>> topProductsByRestaurant(
            @RequestParam UUID restaurantId,
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam(defaultValue = "5") int limit) {
        Instant startInstant = parseInstant(start);
        Instant endInstant = parseInstant(end);
        int safeLimit = normalizeLimit(limit, 5);

        List<DashboardStatsDTO.TopProductItem> result = orderRepository
                .aggregateTopProductsByRestaurant(restaurantId, startInstant, endInstant, safeLimit)
                .stream()
                .map(projection -> DashboardStatsDTO.TopProductItem.builder()
                        .productId(projection.getProductId())
                        .productName(projection.getProductName())
                        .sizeName(projection.getSizeName())
                        .totalQuantitySold(projection.getTotalQuantitySold())
                        .totalRevenue(Optional.ofNullable(projection.getTotalRevenue()).orElse(BigDecimal.ZERO))
                        .build())
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/revenue-by-restaurant")
    public ResponseEntity<List<DashboardStatsDTO.RevenueByRestaurantItem>> revenueByRestaurant(
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam(defaultValue = "10") int limit) {
        Instant startInstant = parseInstant(start);
        Instant endInstant = parseInstant(end);
        int safeLimit = normalizeLimit(limit, 10);

        List<DashboardStatsDTO.RevenueByRestaurantItem> result = orderRepository
                .aggregateRevenueByRestaurant(startInstant, endInstant, safeLimit)
                .stream()
                .map(projection -> DashboardStatsDTO.RevenueByRestaurantItem.builder()
                        .restaurantId(projection.getRestaurantId())
                        .restaurantName(projection.getRestaurantName())
                        .revenue(Optional.ofNullable(projection.getRevenue()).orElse(BigDecimal.ZERO))
                        .orderCount(projection.getOrderCount())
                        .build())
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/hourly-orders")
    public ResponseEntity<List<DashboardStatsDTO.HourlyOrderResponse>> hourlyOrders(
            @RequestParam String start, @RequestParam String end) {
        Instant startInstant = parseInstant(start);
        Instant endInstant = parseInstant(end);

        List<DashboardStatsDTO.HourlyOrderResponse> result = orderRepository.aggregateHourlyOrders(startInstant, endInstant)
                .stream()
                .map(projection -> DashboardStatsDTO.HourlyOrderResponse.builder()
                        .hour(Optional.ofNullable(projection.getHour()).orElse(0))
                        .orderCount(projection.getOrderCount())
                        .build())
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<OrderResponse>> recentOrders(@RequestParam(defaultValue = "10") int limit) {
        int safeLimit = normalizeLimit(limit, 10);
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit));
        return ResponseEntity.ok(orderMapper.toResponseList(orders));
    }

    @GetMapping("/live-orders")
    public ResponseEntity<List<OrderSummaryDTO>> liveOrders(@RequestParam UUID restaurantId) {
        List<OrderStatus> statuses = List.of(OrderStatus.PENDING, OrderStatus.CONFIRMED);
        List<OrderSummaryDTO> result = orderRepository.findByRestaurantIdAndStatusInOrderByCreatedAtAsc(restaurantId, statuses)
                .stream()
                .map(this::toSummary)
                .toList();
        return ResponseEntity.ok(result);
    }

    private Instant parseInstant(String value) {
        try {
            return Instant.parse(value);
        } catch (Exception ex) {
            throw new BadRequestException("Invalid instant value: " + value);
        }
    }

    private int normalizeLimit(int limit, int fallback) {
        return limit > 0 ? limit : fallback;
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
}
