package com.CNTTK18.order_service.service.impl;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import com.CNTTK18.order_service.client.RestaurantClient;
import com.CNTTK18.order_service.exception.ForbiddenException;
import com.CNTTK18.order_service.mapper.OrderMapper;
import com.CNTTK18.order_service.model.Order;
import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.model.data.PaymentStatus;
import com.CNTTK18.order_service.repository.CartRepository;
import com.CNTTK18.order_service.repository.OrderRepository;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private RestaurantClient restaurantClient;

    private OrderServiceImpl orderService;

    @BeforeEach
    void setUp() {
        orderService =
                new OrderServiceImpl(orderRepository, cartRepository, orderMapper, redisTemplate, restaurantClient);
    }

    @Test
    void cancelOrder_shouldThrowForbiddenWhenUserIsNotOrderOwner() {
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();

        Order order = Order.builder()
                .id(orderId)
                .userId(ownerId)
                .status(OrderStatus.PENDING)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThrows(ForbiddenException.class, () -> orderService.cancelOrder(otherUserId, orderId));
    }

    @Test
    void updatePaymentStatus_shouldInvalidateBothUserAndRestaurantCaches() {
        UUID orderId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID restaurantId = UUID.randomUUID();

        Order order = Order.builder()
                .id(orderId)
                .userId(userId)
                .restaurantId(restaurantId)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(redisTemplate.keys(eq("orders:user:" + userId + ":*"))).thenReturn(Set.of("orders:user:key"));
        when(redisTemplate.keys(eq("orders:res:" + restaurantId + ":*"))).thenReturn(Set.of("orders:res:key"));

        orderService.updatePaymentStatus(orderId, true, 12345L, "payment-link");

        verify(redisTemplate).keys("orders:user:" + userId + ":*");
        verify(redisTemplate).keys("orders:res:" + restaurantId + ":*");
        verify(redisTemplate).delete(Set.of("orders:user:key"));
        verify(redisTemplate).delete(Set.of("orders:res:key"));
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void updatePaymentStatus_shouldSkipDeleteWhenNoCacheKeysFound() {
        UUID orderId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID restaurantId = UUID.randomUUID();

        Order order = Order.builder()
                .id(orderId)
                .userId(userId)
                .restaurantId(restaurantId)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(redisTemplate.keys(any(String.class))).thenReturn(Collections.emptySet());

        orderService.updatePaymentStatus(orderId, false, 67890L, "payment-link-2");

        verify(redisTemplate).keys("orders:user:" + userId + ":*");
        verify(redisTemplate).keys("orders:res:" + restaurantId + ":*");
    }
}
