package com.CNTTK18.order_service.service;

import java.util.List;
import java.util.UUID;

import com.CNTTK18.order_service.dto.order.request.CheckoutRequest;
import com.CNTTK18.order_service.dto.order.request.UpdateOrderStatusRequest;
import com.CNTTK18.order_service.dto.order.response.OrderResponse;

public interface OrderService {
    List<OrderResponse> checkout(UUID userId, CheckoutRequest request);

    List<OrderResponse> getEmployeeOrders(UUID userId, int page, int size);

    List<OrderResponse> getRestaurantOrders(
            UUID restaurantId, UUID currentUserId, String currentUserRole, int page, int size);

    OrderResponse getOrderById(UUID orderId, UUID currentUserId, String currentUserRole);

    OrderResponse updateStatus(
            UUID orderId, UUID currentUserId, String currentUserRole, UpdateOrderStatusRequest request);

    OrderResponse cancelOrder(UUID userId, UUID orderId, String reason);

    void updatePaymentStatus(UUID orderId, boolean success, Long orderCode, String paymentLinkId);
}
