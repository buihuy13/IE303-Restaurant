package com.CNTTK18.notification_service.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayDeque;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.CNTTK18.Common.Event.OrderNotificationEvent;

class SSEServiceTest {
    private static final String USER_ID = "00000000-0000-0000-0000-000000000001";

    @Test
    void sendsOrderNotificationToEveryConnectionForUser() throws Exception {
        SseEmitter firstEmitter = mock(SseEmitter.class);
        SseEmitter secondEmitter = mock(SseEmitter.class);
        SSEService service = serviceWith(firstEmitter, secondEmitter);

        service.createEmitter(USER_ID);
        service.createEmitter(USER_ID);
        service.sendOrderNotification(orderNotification());

        assertThat(service.getActiveConnectionCount(USER_ID)).isEqualTo(2);
        verify(firstEmitter, times(2)).send(any(SseEmitter.SseEventBuilder.class));
        verify(secondEmitter, times(2)).send(any(SseEmitter.SseEventBuilder.class));
    }

    @Test
    void completingOldConnectionDoesNotRemoveNewConnection() throws Exception {
        SseEmitter oldEmitter = mock(SseEmitter.class);
        SseEmitter newEmitter = mock(SseEmitter.class);
        SSEService service = serviceWith(oldEmitter, newEmitter);

        service.createEmitter(USER_ID);
        Runnable oldCompletion = completionCallback(oldEmitter);
        service.createEmitter(USER_ID);

        oldCompletion.run();
        service.sendOrderNotification(orderNotification());

        assertThat(service.getActiveConnectionCount(USER_ID)).isEqualTo(1);
        verify(oldEmitter, times(1)).send(any(SseEmitter.SseEventBuilder.class));
        verify(newEmitter, times(2)).send(any(SseEmitter.SseEventBuilder.class));
    }

    @Test
    void failedConnectionIsRemovedWithoutAffectingHealthyConnection() throws Exception {
        SseEmitter failedEmitter = mock(SseEmitter.class);
        SseEmitter healthyEmitter = mock(SseEmitter.class);
        doNothing()
                .doThrow(new IOException("connection closed"))
                .when(failedEmitter)
                .send(any(SseEmitter.SseEventBuilder.class));
        SSEService service = serviceWith(failedEmitter, healthyEmitter);

        service.createEmitter(USER_ID);
        service.createEmitter(USER_ID);
        service.sendHeartbeat();
        service.sendOrderNotification(orderNotification());

        assertThat(service.getActiveConnectionCount(USER_ID)).isEqualTo(1);
        verify(failedEmitter, times(2)).send(any(SseEmitter.SseEventBuilder.class));
        verify(healthyEmitter, times(3)).send(any(SseEmitter.SseEventBuilder.class));
    }

    @Test
    void removesUserEntryWhenLastConnectionCompletes() {
        SseEmitter firstEmitter = mock(SseEmitter.class);
        SseEmitter secondEmitter = mock(SseEmitter.class);
        SSEService service = serviceWith(firstEmitter, secondEmitter);

        service.createEmitter(USER_ID);
        Runnable firstCompletion = completionCallback(firstEmitter);
        service.createEmitter(USER_ID);
        Runnable secondCompletion = completionCallback(secondEmitter);

        firstCompletion.run();
        assertThat(service.getActiveConnectionCount(USER_ID)).isEqualTo(1);

        secondCompletion.run();
        assertThat(service.getActiveConnectionCount(USER_ID)).isZero();
    }

    @Test
    void buildsExplicitOrderStatusPayload() {
        SSEService service = serviceWith();

        Map<String, Object> payload = service.buildOrderNotificationPayload(
                orderNotification(OrderNotificationEvent.EVENT_TYPE_ORDER_STATUS, "PREPARING", "PREPARING", "PAID"));

        assertThat(payload)
                .containsEntry("eventType", OrderNotificationEvent.EVENT_TYPE_ORDER_STATUS)
                .containsEntry("status", "PREPARING")
                .containsEntry("orderStatus", "PREPARING")
                .containsEntry("paymentStatus", "PAID");
    }

    @Test
    void buildsPaymentStatusPayloadWithoutReplacingOrderStatus() {
        SSEService service = serviceWith();

        Map<String, Object> payload = service.buildOrderNotificationPayload(
                orderNotification(OrderNotificationEvent.EVENT_TYPE_PAYMENT_STATUS, "PAID", "PENDING", "PAID"));

        assertThat(payload)
                .containsEntry("eventType", OrderNotificationEvent.EVENT_TYPE_PAYMENT_STATUS)
                .containsEntry("status", "PAID")
                .containsEntry("orderStatus", "PENDING")
                .containsEntry("paymentStatus", "PAID");
    }

    @Test
    void recognizesLegacyPaymentStatusPayload() {
        SSEService service = serviceWith();

        Map<String, Object> payload =
                service.buildOrderNotificationPayload(orderNotification(null, "PAID", null, null));

        assertThat(payload)
                .containsEntry("eventType", OrderNotificationEvent.EVENT_TYPE_PAYMENT_STATUS)
                .containsEntry("paymentStatus", "PAID");
    }

    private SSEService serviceWith(SseEmitter... emitters) {
        ArrayDeque<SseEmitter> emitterQueue = new ArrayDeque<>();
        for (SseEmitter emitter : emitters) {
            emitterQueue.add(emitter);
        }
        return new SSEService(emitterQueue::removeFirst);
    }

    private Runnable completionCallback(SseEmitter emitter) {
        ArgumentCaptor<Runnable> callbackCaptor = ArgumentCaptor.forClass(Runnable.class);
        verify(emitter).onCompletion(callbackCaptor.capture());
        return callbackCaptor.getValue();
    }

    private OrderNotificationEvent orderNotification() {
        return new OrderNotificationEvent(
                UUID.randomUUID(),
                UUID.fromString(USER_ID),
                null,
                "user@example.com",
                "Restaurant",
                BigDecimal.valueOf(100_000),
                "CONFIRMED",
                "Delivery address");
    }

    private OrderNotificationEvent orderNotification(
            String eventType, String status, String orderStatus, String paymentStatus) {
        return new OrderNotificationEvent(
                UUID.randomUUID(),
                UUID.fromString(USER_ID),
                null,
                "user@example.com",
                "Restaurant",
                BigDecimal.valueOf(100_000),
                status,
                "Delivery address",
                eventType,
                orderStatus,
                paymentStatus);
    }
}
