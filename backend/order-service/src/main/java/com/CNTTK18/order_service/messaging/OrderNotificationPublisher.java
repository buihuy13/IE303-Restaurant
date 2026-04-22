package com.CNTTK18.order_service.messaging;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.OrderNotificationContract;
import com.CNTTK18.Common.Event.OrderNotificationEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publish(OrderNotificationEvent event) {
        rabbitTemplate.convertAndSend(
                OrderNotificationContract.EXCHANGE,
                OrderNotificationContract.ROUTING_KEY,
                event);
        log.info("[OrderNotification] Published: orderId={}, status={}",
                event.getOrderId(), event.getStatus());
    }
}
