package com.CNTTK18.blog_service.service;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.CNTTK18.blog_service.dto.response.BlogMetricsResponse;

@Service
public class BlogMetricsSseService {
    private static final long TIMEOUT_MS = 30 * 60 * 1000L;
    private final Map<UUID, Map<String, SseEmitter>> emittersByBlogId = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(UUID blogId, BlogMetricsResponse initialMetrics) {
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        String emitterId = UUID.randomUUID().toString();

        emittersByBlogId
                .computeIfAbsent(blogId, ignored -> new ConcurrentHashMap<>())
                .put(emitterId, emitter);

        emitter.onCompletion(() -> removeEmitter(blogId, emitterId));
        emitter.onTimeout(() -> removeEmitter(blogId, emitterId));
        emitter.onError(ignored -> removeEmitter(blogId, emitterId));

        try {
            emitter.send(SseEmitter.event().name("INIT").data(initialMetrics));
        } catch (IOException e) {
            removeEmitter(blogId, emitterId);
        }

        return emitter;
    }

    public void broadcastMetrics(BlogMetricsResponse metrics) {
        if (metrics == null || metrics.getBlogId() == null) {
            return;
        }
        sendToBlog(metrics.getBlogId(), "BLOG_METRICS_UPDATED", metrics);
    }

    @Scheduled(fixedRate = 20000)
    public void sendHeartbeat() {
        emittersByBlogId.forEach((blogId, emitters) ->
                emitters.forEach((emitterId, emitter) -> send(blogId, emitterId, emitter, "PING", "keep-alive")));
    }

    private void sendToBlog(UUID blogId, String eventName, Object data) {
        Map<String, SseEmitter> emitters = emittersByBlogId.get(blogId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }
        emitters.forEach((emitterId, emitter) -> send(blogId, emitterId, emitter, eventName, data));
    }

    private void send(UUID blogId, String emitterId, SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(data));
        } catch (IOException | IllegalStateException e) {
            removeEmitter(blogId, emitterId);
        }
    }

    private void removeEmitter(UUID blogId, String emitterId) {
        Map<String, SseEmitter> emitters = emittersByBlogId.get(blogId);
        if (emitters == null) {
            return;
        }
        emitters.remove(emitterId);
        if (emitters.isEmpty()) {
            emittersByBlogId.remove(blogId);
        }
    }
}
