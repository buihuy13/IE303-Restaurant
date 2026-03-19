package com.CNTTK18.order_service.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.CNTTK18.order_service.client.RestaurantClient;
import com.CNTTK18.order_service.dto.cart.request.AddToCartRequest;
import com.CNTTK18.order_service.dto.cart.request.UpdateCartItemRequest;
import com.CNTTK18.order_service.dto.cart.response.CartItemResponse;
import com.CNTTK18.order_service.dto.cart.response.CartResponse;
import com.CNTTK18.order_service.dto.cart.response.CartRestaurantGroupResponse;
import com.CNTTK18.order_service.dto.client.ProductClientResponse;
import com.CNTTK18.order_service.dto.client.ProductSizeClientResponse;
import com.CNTTK18.order_service.dto.client.ResClientResponse;
import com.CNTTK18.order_service.exception.BadRequestException;
import com.CNTTK18.order_service.exception.NotFoundException;
import com.CNTTK18.order_service.model.Cart;
import com.CNTTK18.order_service.model.CartItem;
import com.CNTTK18.order_service.model.CartRestaurantGroup;
import com.CNTTK18.order_service.repository.CartRepository;
import com.CNTTK18.order_service.service.CartService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RestaurantClient restaurantClient;

    private static final String CART_CACHE_KEY_PREFIX = "cart:";
    private static final long CART_CACHE_TTL = 7; // days

    @Override
    public CartResponse getCart(UUID userId) {
        Cart cart = getCartModel(userId);
        return mapToResponse(cart);
    }

    @Override
    public CartResponse addToCart(UUID userId, AddToCartRequest request) {
        Cart cart = getCartModel(userId);
        
        // Validate restaurant with restaurant-service
        ResClientResponse resInfo = restaurantClient.getRestaurant(request.getRestaurantId()).block();
        if (resInfo == null) throw new NotFoundException("Restaurant not found");
        if (!resInfo.isEnabled()) throw new BadRequestException("Restaurant is currently disabled");

        // Validate product with restaurant-service
        ProductClientResponse productInfo = restaurantClient.getProduct(request.getProductId()).block();
        if (productInfo == null) throw new NotFoundException("Product not found");
        
        // Verify product belongs to the restaurant
        if (!productInfo.getRestaurantId().equals(request.getRestaurantId())) {
            throw new BadRequestException("Product does not belong to the specified restaurant");
        }

        // Validate product size with restaurant-service
        ProductSizeClientResponse sizeInfo = restaurantClient.getProductSize(request.getProductSizeId()).block();
        if (sizeInfo == null) throw new NotFoundException("Product size not found");

        // Find or create restaurant group
        CartRestaurantGroup group = cart.getRestaurants().stream()
                .filter(g -> g.getRestaurantId().equals(request.getRestaurantId()))
                .findFirst()
                .orElseGet(() -> {
                    CartRestaurantGroup newGroup = CartRestaurantGroup.builder()
                            .restaurantId(request.getRestaurantId())
                            .restaurantName(resInfo.getResName())
                            .items(new ArrayList<>())
                            .build();
                    cart.getRestaurants().add(newGroup);
                    return newGroup;
                });

        // Add or update item
        Optional<CartItem> existingItem = group.getItems().stream()
                .filter(i -> i.getProductSizeId().equals(request.getProductSizeId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .productId(request.getProductId())
                    .productSizeId(request.getProductSizeId())
                    .productName(productInfo.getName())
                    .sizeName(sizeInfo.getSizeName())
                    .price(sizeInfo.getPrice())
                    .quantity(request.getQuantity())
                    .imageUrl(productInfo.getImageUrl())
                    .build();
            group.getItems().add(newItem);
        }

        return saveAndReturn(cart);
    }

    @Override
    public CartResponse updateCartItem(UUID userId, UpdateCartItemRequest request) {
        Cart cart = getCartModel(userId);
        
        boolean removed = false;
        for (CartRestaurantGroup group : cart.getRestaurants()) {
            Optional<CartItem> itemOpt = group.getItems().stream()
                    .filter(i -> i.getProductSizeId().equals(request.getProductSizeId()))
                    .findFirst();
            
            if (itemOpt.isPresent()) {
                if (request.getQuantity() <= 0) {
                    group.getItems().remove(itemOpt.get());
                } else {
                    itemOpt.get().setQuantity(request.getQuantity());
                }
                removed = true;
                break;
            }
        }
        
        if (!removed && request.getQuantity() > 0) {
            throw new NotFoundException("Item not found in cart");
        }

        // Clean up empty groups
        cart.getRestaurants().removeIf(g -> g.getItems().isEmpty());

        return saveAndReturn(cart);
    }

    @Override
    public void clearCart(UUID userId) {
        cartRepository.deleteById(userId.toString());
        redisTemplate.delete(CART_CACHE_KEY_PREFIX + userId);
    }

    private Cart getCartModel(UUID userId) {
        String cacheKey = CART_CACHE_KEY_PREFIX + userId;
        Cart cart = (Cart) redisTemplate.opsForValue().get(cacheKey);
        
        if (cart == null) {
            cart = cartRepository.findByUserId(userId)
                    .orElseGet(() -> Cart.builder()
                            .id(userId.toString())
                            .userId(userId)
                            .restaurants(new ArrayList<>())
                            .build());
            redisTemplate.opsForValue().set(cacheKey, cart, CART_CACHE_TTL, TimeUnit.DAYS);
        }
        return cart;
    }

    private CartResponse saveAndReturn(Cart cart) {
        cartRepository.save(cart);
        redisTemplate.opsForValue().set(CART_CACHE_KEY_PREFIX + cart.getUserId(), cart, CART_CACHE_TTL, TimeUnit.DAYS);
        return mapToResponse(cart);
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartRestaurantGroupResponse> groupResponses = cart.getRestaurants().stream()
                .map(g -> CartRestaurantGroupResponse.builder()
                        .restaurantId(g.getRestaurantId())
                        .restaurantName(g.getRestaurantName())
                        .items(g.getItems().stream()
                                .map(i -> CartItemResponse.builder()
                                        .productId(i.getProductId())
                                        .productSizeId(i.getProductSizeId())
                                        .productName(i.getProductName())
                                        .sizeName(i.getSizeName())
                                        .price(i.getPrice())
                                        .quantity(i.getQuantity())
                                        .imageUrl(i.getImageUrl())
                                        .build())
                                .toList())
                        .build())
                .toList();

        return CartResponse.builder()
                .userId(cart.getUserId())
                .restaurants(groupResponses)
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
}
