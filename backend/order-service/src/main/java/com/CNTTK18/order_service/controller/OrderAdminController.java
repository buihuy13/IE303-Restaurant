package com.CNTTK18.order_service.controller;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.order_service.dto.UserRole;
import com.CNTTK18.order_service.dto.order.request.UpdateOrderStatusRequest;
import com.CNTTK18.order_service.dto.order.response.OrderResponse;
import com.CNTTK18.order_service.dto.order.response.OrderSummaryDTO;
import com.CNTTK18.order_service.exception.ForbiddenException;
import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.service.OrderAdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/orders/admin")
@RequiredArgsConstructor
@Tag(name = "Order Admin", description = "Admin order management APIs")
@Slf4j
public class OrderAdminController {
    private final OrderAdminService orderAdminService;

    @GetMapping
    @Operation(summary = "Get all orders for admin with filters")
    public ResponseEntity<Page<OrderSummaryDTO>> getAllOrders(
            @Parameter(description = "Page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Order status") @RequestParam(required = false) OrderStatus status,
            @Parameter(description = "Restaurant ID") @RequestParam(required = false) UUID restaurantId,
            @Parameter(description = "User ID") @RequestParam(required = false) UUID userId,
            @Parameter(description = "From date (YYYY-MM-DD)")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate dateFrom,
            @Parameter(description = "To date (YYYY-MM-DD)")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate dateTo) {
        requireAdminRole();
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(orderAdminService.getAllOrders(status, restaurantId, userId, dateFrom, dateTo, pageable));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order detail by order ID")
    public ResponseEntity<OrderResponse> getOrderDetail(
            @Parameter(description = "Order ID") @PathVariable UUID orderId) {
        requireAdminRole();
        return ResponseEntity.ok(orderAdminService.getOrderDetail(orderId));
    }

    @PutMapping("/{orderId}/status")
    @Operation(summary = "Update order status by admin")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        requireAdminRole();
        return ResponseEntity.ok(orderAdminService.updateOrderStatus(orderId, request.getStatus()));
    }

    @GetMapping("/export")
    @Operation(summary = "Export orders to CSV")
    public ResponseEntity<byte[]> exportOrders(
            @Parameter(description = "Order status") @RequestParam(required = false) OrderStatus status,
            @Parameter(description = "From date (YYYY-MM-DD)")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate dateFrom,
            @Parameter(description = "To date (YYYY-MM-DD)")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate dateTo) {
        requireAdminRole();

        String csvContent = orderAdminService.exportOrdersCSV(status, dateFrom, dateTo);
        byte[] body = csvContent.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"orders.csv\"");

        return ResponseEntity.ok().headers(headers).body(body);
    }

    private void requireAdminRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication != null ? authentication.getPrincipal() : null;

        if (!(principal instanceof UserRole userRole)) {
            log.error("Missing user role principal in SecurityContext");
            throw new ForbiddenException("Access denied");
        }

        if (!"ADMIN".equals(userRole.getRole())) {
            log.error("Access denied for role: {}", userRole.getRole());
            throw new ForbiddenException("Access denied");
        }
    }
}
