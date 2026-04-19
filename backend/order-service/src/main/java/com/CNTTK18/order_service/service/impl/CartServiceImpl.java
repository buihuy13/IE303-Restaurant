package com.CNTTK18.order_service.service.impl;

import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.CNTTK18.order_service.client.RestaurantClient;
import com.CNTTK18.order_service.dto.cart.request.AddToCartRequest;
import com.CNTTK18.order_service.dto.cart.request.UpdateCartItemRequest;
import com.CNTTK18.order_service.dto.cart.response.CartResponse;
import com.CNTTK18.order_service.dto.client.ProductClientResponse;
import com.CNTTK18.order_service.dto.client.ProductSizeClientResponse;
import com.CNTTK18.order_service.dto.client.ResClientResponse;
import com.CNTTK18.order_service.exception.BadRequestException;
import com.CNTTK18.order_service.exception.NotFoundException;
import com.CNTTK18.order_service.mapper.CartMapper;
import com.CNTTK18.order_service.model.Cart;
import com.CNTTK18.order_service.model.CartItem;
import com.CNTTK18.order_service.model.CartRestaurantGroup;
import com.CNTTK18.order_service.repository.CartRepository;
import com.CNTTK18.order_service.service.CartService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RestaurantClient restaurantClient;
    private final CartMapper cartMapper;

    private static final String CART_CACHE_KEY_PREFIX = "cart:";
    private static final long CART_CACHE_TTL = 7; // days
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Override
    public CartResponse getCart(UUID userId) {
        return cartMapper.toResponse(getCartModel(userId));
    }

    @Override
    /**
     * Adds one product size to user's cart.
     *
     * Flow: load cart -> fetch remote product/restaurant info -> validate -> upsert
     * item -> persist.
     */
    public CartResponse addToCart(UUID userId, AddToCartRequest request) {
        Cart cart = getCartModel(userId);

        AddToCartFetchResult fetchResult = fetchRestaurantAndProductInfo(request);
        validateRestaurantAvailability(fetchResult.resInfo());
        validateProductOwnership(
                fetchResult.productInfo(),
                fetchResult.productResInfo(),
                request.getRestaurantId(),
                request.getProductId());

        CartRestaurantGroup group = getOrCreateRestaurantGroup(cart, request.getRestaurantId(), fetchResult.resInfo());
        addOrIncrementCartItem(group, request, fetchResult.sizeInfo(), fetchResult.productInfo());

        return saveAndReturn(cart);
    }

    @Override
    public CartResponse updateCartItem(UUID userId, UpdateCartItemRequest request) {
        Cart cart = getCartModel(userId);

        boolean found = false;
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
                found = true;
                break;
            }
        }

        if (!found && request.getQuantity() > 0) {
            throw new NotFoundException("Item not found in cart");
        }

        // Clean up empty restaurant groups
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
            cart = cartRepository.findByUserId(userId).orElseGet(() -> Cart.builder()
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
        return cartMapper.toResponse(cart);
    }

    /**
     * Fetches restaurant, product size, and product info in parallel to reduce checkout latency.
     */
    private AddToCartFetchResult fetchRestaurantAndProductInfo(AddToCartRequest request) {
        var fetchResult = Mono.zip(
                        restaurantClient.getRestaurant(request.getRestaurantId()),
                        restaurantClient.getProductSize(request.getProductSizeId()),
                        restaurantClient.getRestaurantByProductId(request.getProductId()),
                        restaurantClient.getProduct(request.getProductId()))
                .block();

        if (fetchResult == null) {
            throw new NotFoundException("Could not reach restaurant service");
        }

        return new AddToCartFetchResult(
                fetchResult.getT1(), fetchResult.getT2(),
                fetchResult.getT3(), fetchResult.getT4());
    }

    /** Ensures restaurant is enabled and currently within opening hours. */
    private void validateRestaurantAvailability(ResClientResponse resInfo) {
        if (!resInfo.isEnabled()) {
            throw new BadRequestException("Restaurant is currently disabled");
        }

        if (resInfo.getOpeningTime() == null || resInfo.getClosingTime() == null) {
            return;
        }

        LocalTime now = LocalTime.now(VIETNAM_ZONE);
        LocalTime open = resInfo.getOpeningTime();
        LocalTime close = resInfo.getClosingTime();

        boolean isOpen;
        if (open.isBefore(close)) {
            // Case: 08:00 - 22:00 (Same day)
            isOpen = !now.isBefore(open) && !now.isAfter(close);
        } else {
            // Case: 18:00 - 02:00 (Overnight)
            // Open if now is after 18:00 OR before 02:00
            isOpen = !now.isBefore(open) || !now.isAfter(close);
        }

        if (!isOpen) {
            throw new BadRequestException("Restaurant is currently closed (Hours: " + open + " - " + close + ")");
        }
    }

    /**
     * Ensures selected product exists, belongs to requested restaurant and matches productId.
     * Uses restaurant-by-product lookup to validate ownership since ProductClientResponse
     * does not carry restaurantId.
     */
    private void validateProductOwnership(
            ProductClientResponse productInfo, ResClientResponse productResInfo, UUID restaurantId, UUID productId) {

        if (productInfo == null) {
            throw new NotFoundException("Product information not found in remote service");
        }

        if (!productInfo.getId().equals(productId)) {
            throw new BadRequestException("Product ID mismatch");
        }

        if (productResInfo == null || !productResInfo.getId().equals(restaurantId)) {
            throw new BadRequestException("Product does not belong to the specified restaurant");
        }
    }

    /**
     * Returns existing restaurant group in cart or creates a new one on first add.
     */
    private CartRestaurantGroup getOrCreateRestaurantGroup(Cart cart, UUID restaurantId, ResClientResponse resInfo) {
        return cart.getRestaurants().stream()
                .filter(g -> g.getRestaurantId().equals(restaurantId))
                .findFirst()
                .orElseGet(() -> {
                    CartRestaurantGroup newGroup = CartRestaurantGroup.builder()
                            .restaurantId(restaurantId)
                            .restaurantName(resInfo.getResName())
                            .items(new ArrayList<>())
                            .build();
                    cart.getRestaurants().add(newGroup);
                    return newGroup;
                });
    }

    /**
     * Increases quantity when item already exists; otherwise appends a new cart
     * item.
     */
    private void addOrIncrementCartItem(
            CartRestaurantGroup group,
            AddToCartRequest request,
            ProductSizeClientResponse sizeInfo,
            ProductClientResponse productInfo) {
        Optional<CartItem> existingItem = group.getItems().stream()
                .filter(i -> i.getProductSizeId().equals(request.getProductSizeId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + request.getQuantity());
            return;
        }

        CartItem newItem = CartItem.builder()
                .productId(productInfo.getId())
                .productSizeId(request.getProductSizeId())
                .productName(productInfo.getProductName())
                .sizeName(sizeInfo.getSizeName())
                .price(sizeInfo.getPrice())
                .quantity(request.getQuantity())
                .imageUrl(productInfo.getImageURL())
                .build();
        group.getItems().add(newItem);
    }

    private record AddToCartFetchResult(
            ResClientResponse resInfo,
            ProductSizeClientResponse sizeInfo,
            ResClientResponse productResInfo,
            ProductClientResponse productInfo) {}
}
