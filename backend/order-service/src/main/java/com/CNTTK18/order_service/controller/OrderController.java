package com.CNTTK18.order_service.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.order_service.dto.UserRole;
import com.CNTTK18.order_service.dto.order.request.CheckoutRequest;
import com.CNTTK18.order_service.dto.order.request.UpdateOrderStatusRequest;
import com.CNTTK18.order_service.dto.order.response.OrderResponse;
import com.CNTTK18.order_service.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
@Tag(name = "Order", description = "Order management APIs")
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Checkout selected restaurants' items from cart")
    public ResponseEntity<List<OrderResponse>> checkout(
            @AuthenticationPrincipal UserRole userRole, @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(orderService.checkout(userRole.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get current user's (employee/customer) orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserRole userRole,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getEmployeeOrders(userRole.getId(), page, size));
    }

    @GetMapping("/restaurant/{restaurantId}")
    @Operation(summary = "Get orders for a restaurant (for merchants)")
    public ResponseEntity<List<OrderResponse>> getRestaurantOrders(
            @AuthenticationPrincipal UserRole userRole,
            @PathVariable UUID restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                orderService.getRestaurantOrders(restaurantId, userRole.getId(), userRole.getRole(), page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<OrderResponse> getOrderById(
            @AuthenticationPrincipal UserRole userRole, @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id, userRole.getId(), userRole.getRole()));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status (Merchants)")
    public ResponseEntity<OrderResponse> updateStatus(
            @AuthenticationPrincipal UserRole userRole,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, userRole.getId(), userRole.getRole(), request));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel order (Customers - only if PENDING)")
    public ResponseEntity<OrderResponse> cancelOrder(
            @AuthenticationPrincipal UserRole userRole, @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.cancelOrder(userRole.getId(), id));
    }

    @PutMapping("/{id}/payment")
    @Operation(summary = "Update payment status (Internal use by payment-service)")
    public ResponseEntity<Void> updatePaymentStatus(
            @PathVariable UUID id,
            @RequestParam boolean success,
            @RequestParam Long orderCode,
            @RequestParam String paymentLinkId) {
        orderService.updatePaymentStatus(id, success, orderCode, paymentLinkId);
        return ResponseEntity.noContent().build();
    }
}
