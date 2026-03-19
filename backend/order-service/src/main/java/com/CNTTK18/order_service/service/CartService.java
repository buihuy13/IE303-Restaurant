package com.CNTTK18.order_service.service;

import java.util.UUID;

import com.CNTTK18.order_service.dto.cart.request.AddToCartRequest;
import com.CNTTK18.order_service.dto.cart.request.UpdateCartItemRequest;
import com.CNTTK18.order_service.dto.cart.response.CartResponse;

public interface CartService {
    CartResponse getCart(UUID userId);
    CartResponse addToCart(UUID userId, AddToCartRequest request);
    CartResponse updateCartItem(UUID userId, UpdateCartItemRequest request);
    void clearCart(UUID userId);
}
