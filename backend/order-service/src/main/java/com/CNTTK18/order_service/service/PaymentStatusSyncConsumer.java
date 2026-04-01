package com.CNTTK18.order_service.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.PaymentStatusSyncContract;
import com.CNTTK18.Common.Event.PaymentStatusSyncEvent;
import com.CNTTK18.order_service.exception.NotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentStatusSyncConsumer {
    private final OrderService orderService;

    @RabbitListener(queues = PaymentStatusSyncContract.QUEUE)
    public void onPaymentStatusUpdated(PaymentStatusSyncEvent event) {
        if (event == null || event.getOrderId() == null || event.getOrderCode() == null) {
            log.warn("Bỏ qua payment status event không hợp lệ: {}", event);
            return;
        }

        try {
            orderService.updatePaymentStatus(
                    event.getOrderId(),
                    event.isSuccess(),
                    event.getOrderCode(),
                    event.getPaymentLinkId() != null ? event.getPaymentLinkId() : "");
            log.info(
                    "Đã đồng bộ payment status từ RabbitMQ cho orderId={}, success={}",
                    event.getOrderId(),
                    event.isSuccess());
        } catch (NotFoundException ex) {
            // Order đã không tồn tại: không retry vô hạn cho cùng một message.
            log.warn("Order không tồn tại khi xử lý payment status event: orderId={}", event.getOrderId());
        }
    }
}
