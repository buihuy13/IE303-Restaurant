package com.CNTTK18.order_service.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
            Authentication authentication, 
            @Valid @RequestBody CheckoutRequest request) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(orderService.checkout(userId, request));
    }

    @GetMapping
    @Operation(summary = "Get current user's (employee/customer) orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(orderService.getEmployeeOrders(userId, page, size));
    }

    @GetMapping("/restaurant/{restaurantId}")
    @Operation(summary = "Get orders for a restaurant (for merchants)")
    public ResponseEntity<List<OrderResponse>> getRestaurantOrders(
            @PathVariable UUID restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getRestaurantOrders(restaurantId, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status (Merchants)")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel order (Customers - only if PENDING)")
    public ResponseEntity<OrderResponse> cancelOrder(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(orderService.cancelOrder(userId, id));
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

    private UUID getUserId(Authentication authentication) {
        UserRole userRole = (UserRole) authentication.getPrincipal();
        return userRole.getId();
    }
}
