package com.CNTTK18.notification_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Event.OrderNotificationContract;
import com.CNTTK18.Common.Event.OrderNotificationEvent;

@Service
public class OrderNotificationConsumer {
    private static final Logger log = LoggerFactory.getLogger(OrderNotificationConsumer.class);

    private final SSEService sseService;
    private final EmailService emailService;

    public OrderNotificationConsumer(SSEService sseService, EmailService emailService) {
        this.sseService = sseService;
        this.emailService = emailService;
    }

    @RabbitListener(queues = OrderNotificationContract.QUEUE)
    public void consume(OrderNotificationEvent event) {
        if (event == null || event.getUserId() == null) {
            log.warn("Skip invalid event: {}", event);
            return;
        }

        sseService.sendOrderNotification(event);

        try {
            emailService.sendOrderStatusEmail(event);
        } catch (RuntimeException ex) {
            log.error("Failed to send status email for orderId={}", event.getOrderId(), ex);
        }
    }
}
