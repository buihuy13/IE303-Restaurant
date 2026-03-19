package com.CNTTK18.order_service.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.order_service.dto.UserRole;
import com.CNTTK18.order_service.dto.cart.request.AddToCartRequest;
import com.CNTTK18.order_service.dto.cart.request.UpdateCartItemRequest;
import com.CNTTK18.order_service.dto.cart.response.CartResponse;
import com.CNTTK18.order_service.service.CartService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Cart management APIs")
public class CartController {
    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping
    @Operation(summary = "Add item to cart")
    public ResponseEntity<CartResponse> addToCart(
            Authentication authentication, @Valid @RequestBody AddToCartRequest request) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    @PutMapping
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<CartResponse> updateCartItem(
            Authentication authentication, @Valid @RequestBody UpdateCartItemRequest request) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(cartService.updateCartItem(userId, request));
    }

    @DeleteMapping
    @Operation(summary = "Clear cart")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        UUID userId = getUserId(authentication);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId(Authentication authentication) {
        UserRole userRole = (UserRole) authentication.getPrincipal();
        return userRole.getId();
    }
}
