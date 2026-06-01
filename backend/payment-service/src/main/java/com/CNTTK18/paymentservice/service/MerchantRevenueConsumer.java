package com.CNTTK18.paymentservice.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.MerchantRevenueContract;
import com.CNTTK18.Common.Event.MerchantRevenueEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class MerchantRevenueConsumer {
    private final WalletService walletService;

    @RabbitListener(queues = MerchantRevenueContract.QUEUE)
    public void consume(MerchantRevenueEvent event) {
        log.info(
                "Received merchant revenue event: orderId={}, merchantId={}, amount={}",
                event.getOrderId(),
                event.getMerchantId(),
                event.getAmount());
        walletService.creditMerchantRevenue(event);
    }
}
