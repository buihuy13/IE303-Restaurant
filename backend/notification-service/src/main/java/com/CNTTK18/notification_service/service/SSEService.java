package com.CNTTK18.notification_service.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.CNTTK18.Common.Event.BlogMetricsEvent;
import com.CNTTK18.Common.Event.OrderNotificationEvent;

@Service
public class SSEService {
    // Vì web chỉ có 1 instance
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<UUID, Map<String, SseEmitter>> blogMetricsEmittersByBlogId = new ConcurrentHashMap<>();
    private static final long TIME_OUT = 30 * 60 * 1000L; // 30p

    public SseEmitter createEmitter(String userId) {
        SseEmitter emitter = new SseEmitter(TIME_OUT);

        this.emitters.put(userId, emitter);

        emitter.onCompletion(() -> this.emitters.remove(userId));
        emitter.onTimeout(() -> this.emitters.remove(userId));
        emitter.onError((e) -> this.emitters.remove(userId));

        // Gửi event đầu tiên để confirm connection
        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connection established"));
        } catch (Exception e) {
            this.emitters.remove(userId);
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
        // Dùng entrySet để vừa duyệt vừa lấy key/value
        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            String userId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            // Giữ connection
            handleEmit(emitter, "PING", "keep-alive", userId);
        }

        blogMetricsEmittersByBlogId.forEach((blogId, emittersById) -> emittersById.forEach(
                (emitterId, emitter) -> handleBlogMetricsEmit(blogId, emitterId, emitter, "PING", "keep-alive")));
    }

    public void sendOrderNotification(OrderNotificationEvent event) {
        if (event == null || event.getUserId() == null) {
            return;
        }

        String userId = event.getUserId().toString();
        SseEmitter emitter = this.emitters.get(userId);
        if (emitter == null) {
            return;
        }

        String status = event.getStatus() == null ? "UNKNOWN" : event.getStatus();
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", event.getOrderId());
        payload.put("status", status);
        payload.put("restaurantName", event.getRestaurantName());
        payload.put("totalPrice", event.getTotalPrice());
        payload.put("deliveryAddress", event.getDeliveryAddress());
        payload.put("message", buildStatusMessage(status, event.getRestaurantName()));

        handleEmit(emitter, "ORDER_NOTIFICATION", payload, userId);
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

    private String buildStatusMessage(String status, String restaurantName) {
        String resName = restaurantName == null ? "restaurant" : restaurantName;
        if ("CANCELLED".equalsIgnoreCase(status) || "FAILED".equalsIgnoreCase(status)) {
            return "Your order at " + resName + " failed or was cancelled.";
        }
        return "Your order at " + resName + " was processed successfully.";
    }

    private void handleEmit(SseEmitter emitter, String eventName, Object message, String userId) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(message));
        } catch (Exception e) {
            this.emitters.remove(userId);
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
