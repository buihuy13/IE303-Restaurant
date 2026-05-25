package com.CNTTK18.paymentservice.service.Impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import com.CNTTK18.Common.Event.PaymentStatusSyncContract;
import com.CNTTK18.Common.Event.PaymentStatusSyncEvent;
import com.CNTTK18.paymentservice.model.PaymentTransaction;
import com.CNTTK18.paymentservice.model.data.PaymentStatus;
import com.CNTTK18.paymentservice.repository.PaymentTransactionRepository;

import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {
    private static final String CHECKSUM_KEY = "test-checksum-key";

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    private PaymentServiceImpl paymentService;
    private PayOS payOS;

    @BeforeEach
    void setUp() {
        payOS = new PayOS("client-id", "api-key", CHECKSUM_KEY);
        paymentService = new PaymentServiceImpl(payOS, paymentTransactionRepository, rabbitTemplate);
    }

    @Test
    void processWebhookAcceptsPayOsDataSignatureAndMarksTransactionPaid() {
        UUID orderId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        long orderCode = 628135101L;
        String paymentLinkId = "pay_link_628135101";

        PaymentTransaction transaction = PaymentTransaction.builder()
                .orderId(orderId)
                .userId(userId)
                .orderCode(orderCode)
                .amount(42000L)
                .status(PaymentStatus.PENDING)
                .paymentLinkId("old_link")
                .build();
        when(paymentTransactionRepository.findByOrderCode(orderCode)).thenReturn(Optional.of(transaction));

        Map<String, Object> webhookBody = validPayOsWebhookBody(orderCode, paymentLinkId);
        String signature = (String) webhookBody.get("signature");

        boolean processed = paymentService.processWebhook(webhookBody, signature);

        assertThat(processed).isTrue();
        assertThat(transaction.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(transaction.getPaymentLinkId()).isEqualTo(paymentLinkId);
        verify(paymentTransactionRepository).save(transaction);

        ArgumentCaptor<PaymentStatusSyncEvent> eventCaptor = ArgumentCaptor.forClass(PaymentStatusSyncEvent.class);
        verify(rabbitTemplate)
                .convertAndSend(
                        eq(PaymentStatusSyncContract.EXCHANGE),
                        eq(PaymentStatusSyncContract.ROUTING_KEY),
                        eventCaptor.capture());

        PaymentStatusSyncEvent event = eventCaptor.getValue();
        assertThat(event.getOrderId()).isEqualTo(orderId);
        assertThat(event.isSuccess()).isTrue();
        assertThat(event.getOrderCode()).isEqualTo(orderCode);
        assertThat(event.getPaymentLinkId()).isEqualTo(paymentLinkId);
    }

    private Map<String, Object> validPayOsWebhookBody(long orderCode, String paymentLinkId) {
        WebhookData signedData = new WebhookData();
        signedData.setOrderCode(orderCode);
        signedData.setAmount(42000L);
        signedData.setDescription("Thanh toan don hang");
        signedData.setAccountNumber("1234567890");
        signedData.setReference("FT2514529876");
        signedData.setTransactionDateTime("2026-05-25 14:15:24");
        signedData.setCurrency("VND");
        signedData.setPaymentLinkId(paymentLinkId);
        signedData.setCode("00");
        signedData.setDesc("success");

        String signature = payOS.getCrypto().createSignatureFromObj(signedData, CHECKSUM_KEY);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderCode", orderCode);
        data.put("amount", 42000L);
        data.put("description", "Thanh toan don hang");
        data.put("accountNumber", "1234567890");
        data.put("reference", "FT2514529876");
        data.put("transactionDateTime", "2026-05-25 14:15:24");
        data.put("currency", "VND");
        data.put("paymentLinkId", paymentLinkId);
        data.put("code", "00");
        data.put("desc", "success");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", "00");
        body.put("desc", "success");
        body.put("success", true);
        body.put("data", data);
        body.put("signature", signature);
        return body;
    }
}
