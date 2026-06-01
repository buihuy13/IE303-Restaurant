package com.CNTTK18.order_service.messaging;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.MerchantRevenueContract;
import com.CNTTK18.Common.Event.MerchantRevenueEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class MerchantRevenuePublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publish(MerchantRevenueEvent event) {
        rabbitTemplate.convertAndSend(MerchantRevenueContract.EXCHANGE, MerchantRevenueContract.ROUTING_KEY, event);
        log.info(
                "[MerchantRevenue] Published: orderId={}, merchantId={}, amount={}",
                event.getOrderId(),
                event.getMerchantId(),
                event.getAmount());
    }
}
