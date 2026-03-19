package com.CNTTK18.order_service.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.CNTTK18.order_service.dto.order.request.CheckoutRequest;
import com.CNTTK18.order_service.dto.order.request.UpdateOrderStatusRequest;
import com.CNTTK18.order_service.dto.order.response.OrderResponse;
import com.CNTTK18.order_service.exception.BadRequestException;
import com.CNTTK18.order_service.exception.NotFoundException;
import com.CNTTK18.order_service.mapper.OrderMapper;
import com.CNTTK18.order_service.model.Cart;
import com.CNTTK18.order_service.model.CartRestaurantGroup;
import com.CNTTK18.order_service.model.Order;
import com.CNTTK18.order_service.model.OrderItem;
import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.model.data.PaymentStatus;
import com.CNTTK18.order_service.repository.CartRepository;
import com.CNTTK18.order_service.repository.OrderRepository;
import com.CNTTK18.order_service.service.OrderService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OrderMapper orderMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String ORDERS_USER_CACHE_PREFIX = "orders:user:";
    private static final String ORDERS_RES_CACHE_PREFIX = "orders:res:";

    @Override
    public List<OrderResponse> checkout(UUID userId, CheckoutRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Cart not found"));

        List<Order> newOrders = new ArrayList<>();
        List<CartRestaurantGroup> groupsToRemove = new ArrayList<>();

        for (UUID restaurantId : request.getRestaurantIds()) {
            CartRestaurantGroup group = cart.getRestaurants().stream()
                    .filter(g -> g.getRestaurantId().equals(restaurantId))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Restaurant " + restaurantId + " not found in cart"));

            BigDecimal totalPrice = group.getItems().stream()
                    .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Order order = Order.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .restaurantId(restaurantId)
                    .restaurantName(group.getRestaurantName())
                    .items(group.getItems().stream()
                            .map(item -> OrderItem.builder()
                                    .productId(item.getProductId())
                                    .productSizeId(item.getProductSizeId())
                                    .productName(item.getProductName())
                                    .sizeName(item.getSizeName())
                                    .price(item.getPrice())
                                    .quantity(item.getQuantity())
                                    .build())
                            .toList())
                    .totalPrice(totalPrice)
                    .deliveryAddress(request.getDeliveryAddress())
                    .note(request.getNote())
                    .status(OrderStatus.PENDING)
                    .paymentStatus(PaymentStatus.UNPAID)
                    .build();

            newOrders.add(order);
            groupsToRemove.add(group);
        }

        // Save orders
        List<Order> savedOrders = orderRepository.saveAll(newOrders);

        // Update Cart
        cart.getRestaurants().removeAll(groupsToRemove);
        cartRepository.save(cart);
        
        // Invalidate user cart cache
        redisTemplate.delete("cart:" + userId);
        // Invalidate user orders list cache
        clearUserOrderCache(userId);

        return orderMapper.toResponseList(savedOrders);
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<OrderResponse> getEmployeeOrders(UUID userId, int page, int size) {
        String cacheKey = ORDERS_USER_CACHE_PREFIX + userId + ":page:" + page + ":size:" + size;
        List<OrderResponse> cached = (List<OrderResponse>) redisTemplate.opsForValue().get(cacheKey);
        
        if (cached != null) return cached;

        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByUserId(userId, pageable);
        List<OrderResponse> responseList = orderMapper.toResponseList(orders.getContent());
        
        redisTemplate.opsForValue().set(cacheKey, responseList, 5, TimeUnit.MINUTES);
        return responseList;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<OrderResponse> getRestaurantOrders(UUID restaurantId, int page, int size) {
        String cacheKey = ORDERS_RES_CACHE_PREFIX + restaurantId + ":page:" + page + ":size:" + size;
        List<OrderResponse> cached = (List<OrderResponse>) redisTemplate.opsForValue().get(cacheKey);
        
        if (cached != null) return cached;

        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByRestaurantId(restaurantId, pageable);
        List<OrderResponse> responseList = orderMapper.toResponseList(orders.getContent());
        
        redisTemplate.opsForValue().set(cacheKey, responseList, 2, TimeUnit.MINUTES);
        return responseList;
    }

    @Override
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        return orderMapper.toResponse(order);
    }

    @Override
    public OrderResponse updateStatus(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // Validation Rule: Can only set to COMPLETED if Paid
        if (request.getStatus() == OrderStatus.COMPLETED && order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("Order has not been paid yet");
        }

        order.setStatus(request.getStatus());
        Order saved = orderRepository.save(order);
        
        // Invalidate caches
        clearRestaurantOrderCache(order.getRestaurantId());
        clearUserOrderCache(order.getUserId());

        return orderMapper.toResponse(saved);
    }

    @Override
    public OrderResponse cancelOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new BadRequestException("You are not authorized to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order can only be cancelled while in PENDING status");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        
        clearUserOrderCache(userId);
        clearRestaurantOrderCache(order.getRestaurantId());

        return orderMapper.toResponse(saved);
    }

    @Override
    public void updatePaymentStatus(UUID orderId, boolean success, Long orderCode, String paymentLinkId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        order.setPaymentStatus(success ? PaymentStatus.PAID : PaymentStatus.FAILED);
        order.setOrderCode(orderCode);
        order.setPaymentLinkId(paymentLinkId);
        
        orderRepository.save(order);
        clearUserOrderCache(order.getUserId());
    }

    private void clearUserOrderCache(UUID userId) {
        String pattern = ORDERS_USER_CACHE_PREFIX + userId + ":*";
        java.util.Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) redisTemplate.delete(keys);
    }

    private void clearRestaurantOrderCache(UUID restaurantId) {
        String pattern = ORDERS_RES_CACHE_PREFIX + restaurantId + ":*";
        java.util.Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) redisTemplate.delete(keys);
    }
}
