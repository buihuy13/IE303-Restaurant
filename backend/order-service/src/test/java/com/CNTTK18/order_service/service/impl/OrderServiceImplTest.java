package com.CNTTK18.order_service.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.CNTTK18.Common.Event.OrderNotificationEvent;
import com.CNTTK18.order_service.client.RestaurantClient;
import com.CNTTK18.order_service.dto.order.request.UpdateOrderStatusRequest;
import com.CNTTK18.order_service.dto.order.response.OrderResponse;
import com.CNTTK18.order_service.mapper.OrderMapper;
import com.CNTTK18.order_service.messaging.MerchantRevenuePublisher;
import com.CNTTK18.order_service.messaging.OrderNotificationPublisher;
import com.CNTTK18.order_service.model.Order;
import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.model.data.PaymentStatus;
import com.CNTTK18.order_service.repository.CartRepository;
import com.CNTTK18.order_service.repository.OrderRepository;

class OrderServiceImplTest {
    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final CartRepository cartRepository = mock(CartRepository.class);
    private final OrderMapper orderMapper = mock(OrderMapper.class);
    private final RestaurantClient restaurantClient = mock(RestaurantClient.class);
    private final OrderNotificationPublisher notificationPublisher = mock(OrderNotificationPublisher.class);
    private final MerchantRevenuePublisher merchantRevenuePublisher = mock(MerchantRevenuePublisher.class);
    private final OrderServiceImpl service = new OrderServiceImpl(
            orderRepository,
            cartRepository,
            orderMapper,
            restaurantClient,
            notificationPublisher,
            merchantRevenuePublisher);

    @Test
    void updateStatusPublishesExplicitOrderStatusEvent() {
        UUID orderId = UUID.randomUUID();
        Order order = order(orderId, OrderStatus.PENDING, PaymentStatus.PAID);
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
        request.setStatus(OrderStatus.CONFIRMED);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);
        when(orderMapper.toResponse(order)).thenReturn(new OrderResponse());

        service.updateStatus(orderId, UUID.randomUUID(), "ADMIN", request);

        OrderNotificationEvent event = publishedNotification();
        assertThat(event.getEventType()).isEqualTo(OrderNotificationEvent.EVENT_TYPE_ORDER_STATUS);
        assertThat(event.getStatus()).isEqualTo("CONFIRMED");
        assertThat(event.getOrderStatus()).isEqualTo("CONFIRMED");
        assertThat(event.getPaymentStatus()).isEqualTo("PAID");
    }

    @Test
    void updatePaymentStatusPublishesExplicitPaymentStatusEvent() {
        UUID orderId = UUID.randomUUID();
        Order order = order(orderId, OrderStatus.PENDING, PaymentStatus.UNPAID);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        service.updatePaymentStatus(orderId, true, 123L, "payment-link");

        OrderNotificationEvent event = publishedNotification();
        assertThat(event.getEventType()).isEqualTo(OrderNotificationEvent.EVENT_TYPE_PAYMENT_STATUS);
        assertThat(event.getStatus()).isEqualTo("PAID");
        assertThat(event.getOrderStatus()).isEqualTo("PENDING");
        assertThat(event.getPaymentStatus()).isEqualTo("PAID");
    }

    private OrderNotificationEvent publishedNotification() {
        ArgumentCaptor<OrderNotificationEvent> eventCaptor = ArgumentCaptor.forClass(OrderNotificationEvent.class);
        verify(notificationPublisher).publish(eventCaptor.capture());
        return eventCaptor.getValue();
    }

    private Order order(UUID orderId, OrderStatus orderStatus, PaymentStatus paymentStatus) {
        return Order.builder()
                .id(orderId)
                .userId(UUID.randomUUID())
                .merchantId(UUID.randomUUID())
                .restaurantId(UUID.randomUUID())
                .restaurantName("Restaurant")
                .totalPrice(BigDecimal.valueOf(100_000))
                .deliveryAddress("Delivery address")
                .status(orderStatus)
                .paymentStatus(paymentStatus)
                .build();
    }
}
