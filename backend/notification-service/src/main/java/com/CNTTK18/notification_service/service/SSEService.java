package com.CNTTK18.notification_service.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class SSEService {
    // Vì web chỉ có 1 instance
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
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

    @Scheduled(fixedRate = 20000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;

        // Dùng entrySet để vừa duyệt vừa lấy key/value
        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            String userId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            // Giữ connection
            handleEmit(emitter, "PING", "keep-alive", userId);
        }
    }

    private void handleEmit(SseEmitter emitter, String eventName, String message, String userId) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(message));
        } catch (Exception e) {
            this.emitters.remove(userId);
        }
    }
}
