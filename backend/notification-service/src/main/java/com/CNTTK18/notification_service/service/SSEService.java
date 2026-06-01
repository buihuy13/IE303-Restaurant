package com.CNTTK18.notification_service.service;

import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.CNTTK18.Common.Event.BlogMetricsEvent;
import com.CNTTK18.Common.Event.OrderNotificationEvent;

@Service
public class SSEService {
    private static final Logger log = LoggerFactory.getLogger(SSEService.class);
    private static final long TIME_OUT = 30 * 60 * 1000L; // 30p

    private final Map<String, Map<String, SseEmitter>> emittersByUserId = new ConcurrentHashMap<>();
    private final Map<UUID, Map<String, SseEmitter>> blogMetricsEmittersByBlogId = new ConcurrentHashMap<>();
    private final Supplier<SseEmitter> emitterFactory;

    public SSEService() {
        this(() -> new SseEmitter(TIME_OUT));
    }

    SSEService(Supplier<SseEmitter> emitterFactory) {
        this.emitterFactory = emitterFactory;
    }

    public SseEmitter createEmitter(String userId) {
        SseEmitter emitter = emitterFactory.get();
        String emitterId = UUID.randomUUID().toString();

        emittersByUserId.compute(userId, (ignored, emittersById) -> {
            Map<String, SseEmitter> updatedEmitters = emittersById == null ? new ConcurrentHashMap<>() : emittersById;
            updatedEmitters.put(emitterId, emitter);
            return updatedEmitters;
        });
        log.info(
                "[SSE] Subscribed: userId={}, emitterId={}, activeConnections={}",
                userId,
                emitterId,
                getActiveConnectionCount(userId));

        emitter.onCompletion(() -> removeEmitter(userId, emitterId));
        emitter.onTimeout(() -> removeEmitter(userId, emitterId));
        emitter.onError((e) -> removeEmitter(userId, emitterId));

        // Gửi event đầu tiên để confirm connection
        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connection established"));
        } catch (Exception e) {
            removeEmitter(userId, emitterId);
        }
        return emitter;
    }

    public SseEmitter createBlogMetricsEmitter(UUID blogId) {
        SseEmitter emitter = new SseEmitter(TIME_OUT);
        String emitterId = UUID.randomUUID().toString();

        blogMetricsEmittersByBlogId
                .computeIfAbsent(blogId, ignored -> new ConcurrentHashMap<>())
                .put(emitterId, emitter);

        emitter.onCompletion(() -> removeBlogMetricsEmitter(blogId, emitterId));
        emitter.onTimeout(() -> removeBlogMetricsEmitter(blogId, emitterId));
        emitter.onError((e) -> removeBlogMetricsEmitter(blogId, emitterId));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connection established"));
        } catch (Exception e) {
            removeBlogMetricsEmitter(blogId, emitterId);
        }
        return emitter;
    }

    @Scheduled(fixedRate = 20000)
    public void sendHeartbeat() {
        emittersByUserId.forEach((userId, emittersById) -> emittersById.forEach(
                (emitterId, emitter) -> handleEmit(userId, emitterId, emitter, "PING", "keep-alive")));

        blogMetricsEmittersByBlogId.forEach((blogId, emittersById) -> emittersById.forEach(
                (emitterId, emitter) -> handleBlogMetricsEmit(blogId, emitterId, emitter, "PING", "keep-alive")));
    }

    public void sendOrderNotification(OrderNotificationEvent event) {
        if (event == null || event.getUserId() == null) {
            return;
        }

        String status = defaultIfBlank(event.getStatus(), "UNKNOWN");
        String eventType = resolveEventType(event);
        Map<String, Object> payload = buildOrderNotificationPayload(event);

        LinkedHashSet<String> recipientIds = new LinkedHashSet<>();
        recipientIds.add(event.getUserId().toString());
        if (event.getMerchantId() != null) {
            recipientIds.add(event.getMerchantId().toString());
        }

        recipientIds.forEach(recipientId -> {
            Map<String, SseEmitter> emittersById = emittersByUserId.get(recipientId);
            int activeConnections = emittersById == null ? 0 : emittersById.size();
            log.info(
                    "[SSE] Delivering order notification: orderId={}, eventType={}, status={}, recipientId={}, activeConnections={}",
                    event.getOrderId(),
                    eventType,
                    status,
                    recipientId,
                    activeConnections);
            if (emittersById != null) {
                emittersById.forEach((emitterId, emitter) ->
                        handleEmit(recipientId, emitterId, emitter, "ORDER_NOTIFICATION", payload));
            }
        });
    }

    public void sendBlogMetrics(BlogMetricsEvent event) {
        if (event == null || event.getBlogId() == null) {
            return;
        }

        Map<String, SseEmitter> emittersById = blogMetricsEmittersByBlogId.get(event.getBlogId());
        if (emittersById == null || emittersById.isEmpty()) {
            return;
        }

        emittersById.forEach((emitterId, emitter) ->
                handleBlogMetricsEmit(event.getBlogId(), emitterId, emitter, "BLOG_METRICS_UPDATED", event));
    }

    Map<String, Object> buildOrderNotificationPayload(OrderNotificationEvent event) {
        String status = defaultIfBlank(event.getStatus(), "UNKNOWN");
        String eventType = resolveEventType(event);
        String orderStatus = event.getOrderStatus();
        String paymentStatus = event.getPaymentStatus();

        if (OrderNotificationEvent.EVENT_TYPE_ORDER_STATUS.equals(eventType)) {
            orderStatus = defaultIfBlank(orderStatus, status);
        } else if (OrderNotificationEvent.EVENT_TYPE_PAYMENT_STATUS.equals(eventType)) {
            paymentStatus = defaultIfBlank(paymentStatus, status);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", event.getOrderId());
        payload.put("eventType", eventType);
        payload.put("status", status);
        payload.put("orderStatus", orderStatus);
        payload.put("paymentStatus", paymentStatus);
        payload.put("restaurantName", event.getRestaurantName());
        payload.put("totalPrice", event.getTotalPrice());
        payload.put("deliveryAddress", event.getDeliveryAddress());
        payload.put("message", buildStatusMessage(eventType, status, event.getRestaurantName()));
        return payload;
    }

    private String buildStatusMessage(String eventType, String status, String restaurantName) {
        String resName = restaurantName == null ? "restaurant" : restaurantName;
        if ("CANCELLED".equalsIgnoreCase(status) || "FAILED".equalsIgnoreCase(status)) {
            return "Your order at " + resName + " failed or was cancelled.";
        }
        if (OrderNotificationEvent.EVENT_TYPE_PAYMENT_STATUS.equals(eventType)) {
            return "Your payment for the order at " + resName + " was updated.";
        }
        return "Your order at " + resName + " was processed successfully.";
    }

    private String resolveEventType(OrderNotificationEvent event) {
        if (event.getEventType() != null && !event.getEventType().isBlank()) {
            return event.getEventType();
        }
        if (event.getOrderStatus() == null
                && (event.getPaymentStatus() != null || isPaymentStatus(event.getStatus()))) {
            return OrderNotificationEvent.EVENT_TYPE_PAYMENT_STATUS;
        }
        return OrderNotificationEvent.EVENT_TYPE_ORDER_STATUS;
    }

    private boolean isPaymentStatus(String status) {
        return "UNPAID".equalsIgnoreCase(status)
                || "PAID".equalsIgnoreCase(status)
                || "FAILED".equalsIgnoreCase(status);
    }

    private String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private void handleEmit(String userId, String emitterId, SseEmitter emitter, String eventName, Object message) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(message));
        } catch (Exception e) {
            removeEmitter(userId, emitterId);
        }
    }

    private void handleBlogMetricsEmit(
            UUID blogId, String emitterId, SseEmitter emitter, String eventName, Object message) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(message));
        } catch (Exception e) {
            removeBlogMetricsEmitter(blogId, emitterId);
        }
    }

    int getActiveConnectionCount(String userId) {
        Map<String, SseEmitter> emittersById = emittersByUserId.get(userId);
        return emittersById == null ? 0 : emittersById.size();
    }

    private void removeEmitter(String userId, String emitterId) {
        AtomicBoolean removed = new AtomicBoolean(false);
        AtomicInteger activeConnections = new AtomicInteger();

        emittersByUserId.computeIfPresent(userId, (ignored, emittersById) -> {
            removed.set(emittersById.remove(emitterId) != null);
            activeConnections.set(emittersById.size());
            return emittersById.isEmpty() ? null : emittersById;
        });

        if (removed.get()) {
            log.info(
                    "[SSE] Unsubscribed: userId={}, emitterId={}, activeConnections={}",
                    userId,
                    emitterId,
                    activeConnections.get());
        }
    }

    private void removeBlogMetricsEmitter(UUID blogId, String emitterId) {
        Map<String, SseEmitter> emittersById = blogMetricsEmittersByBlogId.get(blogId);
        if (emittersById == null) {
            return;
        }
        emittersById.remove(emitterId);
        if (emittersById.isEmpty()) {
            blogMetricsEmittersByBlogId.remove(blogId);
        }
    }
}
