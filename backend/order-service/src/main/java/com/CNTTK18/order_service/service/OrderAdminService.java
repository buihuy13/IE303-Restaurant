package com.CNTTK18.order_service.service;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.CNTTK18.order_service.dto.order.response.OrderResponse;
import com.CNTTK18.order_service.dto.order.response.OrderSummaryDTO;
import com.CNTTK18.order_service.model.data.OrderStatus;
public interface OrderAdminService {
    Page<OrderSummaryDTO> getAllOrders(
            OrderStatus status,
            UUID restaurantId,
            UUID userId,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable);

    OrderResponse getOrderDetail(UUID orderId);

    OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus);

    String exportOrdersCSV(OrderStatus status, LocalDate dateFrom, LocalDate dateTo);
}
