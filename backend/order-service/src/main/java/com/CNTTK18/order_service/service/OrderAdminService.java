package com.CNTTK18.order_service.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.CNTTK18.order_service.dto.order.response.OrderResponse;
import com.CNTTK18.order_service.dto.order.response.OrderSummaryDTO;
import com.CNTTK18.order_service.exception.BadRequestException;
import com.CNTTK18.order_service.exception.NotFoundException;
import com.CNTTK18.order_service.mapper.OrderMapper;
import com.CNTTK18.order_service.model.Order;
import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.repository.OrderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderAdminService {
    private static final ZoneOffset UTC = ZoneOffset.UTC;

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    public Page<OrderSummaryDTO> getAllOrders(
            OrderStatus status,
            UUID restaurantId,
            UUID userId,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable) {
        List<Order> filteredOrders = filterOrders(status, restaurantId, userId, dateFrom, dateTo);

        int startIndex = Math.toIntExact(pageable.getOffset());
        if (startIndex >= filteredOrders.size()) {
            return new PageImpl<>(List.of(), pageable, filteredOrders.size());
        }

        int endIndex = Math.min(startIndex + pageable.getPageSize(), filteredOrders.size());
        List<OrderSummaryDTO> content = filteredOrders.subList(startIndex, endIndex).stream()
                .map(this::toSummary)
                .toList();

        return new PageImpl<>(content, pageable, filteredOrders.size());
    }

    public OrderResponse getOrderDetail(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found"));
        return orderMapper.toResponse(order);
    }

    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found"));

        if (newStatus == null) {
            throw new BadRequestException("status is required");
        }

        OrderStatus currentStatus = order.getStatus();
        if (!isValidTransition(currentStatus, newStatus)) {
            log.error("Invalid order status transition from {} to {}", currentStatus, newStatus);
            throw new BadRequestException("Invalid status transition");
        }

        if (currentStatus != newStatus) {
            order.setStatus(newStatus);
            order = orderRepository.save(order);
        }

        return orderMapper.toResponse(order);
    }

    public String exportOrdersCSV(OrderStatus status, LocalDate dateFrom, LocalDate dateTo) {
        List<Order> orders = filterOrders(status, null, null, dateFrom, dateTo);

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("orderCode,restaurantName,totalPrice,status,paymentStatus,createdAt\n");

        for (Order order : orders) {
            csvBuilder
                    .append(safeCsv(order.getOrderCode()))
                    .append(',')
                    .append(safeCsv(order.getRestaurantName()))
                    .append(',')
                    .append(safeCsv(order.getTotalPrice()))
                    .append(',')
                    .append(safeCsv(order.getStatus()))
                    .append(',')
                    .append(safeCsv(order.getPaymentStatus()))
                    .append(',')
                    .append(safeCsv(order.getCreatedAt()))
                    .append('\n');
        }

        return csvBuilder.toString();
    }

    private List<Order> filterOrders(
            OrderStatus status, UUID restaurantId, UUID userId, LocalDate dateFrom, LocalDate dateTo) {
        Instant start = Optional.ofNullable(dateFrom)
                .map(date -> date.atStartOfDay(UTC).toInstant())
                .orElse(null);
        Instant end = Optional.ofNullable(dateTo)
                .map(date -> date.plusDays(1).atStartOfDay(UTC).minusNanos(1).toInstant())
                .orElse(null);

        if (start != null && end != null && start.isAfter(end)) {
            throw new BadRequestException("dateFrom cannot be after dateTo");
        }

        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .filter(order -> status == null || status == order.getStatus())
                .filter(order -> restaurantId == null || restaurantId.equals(order.getRestaurantId()))
                .filter(order -> userId == null || userId.equals(order.getUserId()))
                .filter(order -> start == null
                        || (order.getCreatedAt() != null
                                && !order.getCreatedAt().isBefore(start)))
                .filter(order -> end == null
                        || (order.getCreatedAt() != null
                                && !order.getCreatedAt().isAfter(end)))
                .toList();
    }

    private boolean isValidTransition(OrderStatus currentStatus, OrderStatus nextStatus) {
        if (currentStatus == null) {
            return false;
        }

        if (currentStatus == nextStatus) {
            return true;
        }

        if (nextStatus == OrderStatus.CANCELLED) {
            return currentStatus != OrderStatus.COMPLETED;
        }

        return switch (currentStatus) {
            case PENDING -> nextStatus == OrderStatus.CONFIRMED;
            case CONFIRMED -> nextStatus == OrderStatus.PREPARING;
            case PREPARING -> nextStatus == OrderStatus.DELIVERING;
            case DELIVERING -> nextStatus == OrderStatus.COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };
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

    private String safeCsv(Object value) {
        String text = value == null ? "" : String.valueOf(value);
        boolean needsQuoting = text.contains(",") || text.contains("\"") || text.contains("\n") || text.contains("\r");

        if (!needsQuoting) {
            return text;
        }

        return '"' + text.replace("\"", "\"\"") + '"';
    }
}
