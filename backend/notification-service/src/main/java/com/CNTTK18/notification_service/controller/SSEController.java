package com.CNTTK18.notification_service.controller;

import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.CNTTK18.notification_service.service.SSEService;

@RestController
public class SSEController {
    private final SSEService sseService;

    public SSEController(SSEService sseService) {
        this.sseService = sseService;
    }

    @GetMapping(value = "/api/sse/subscribe/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subcribeEmitter(@PathVariable String userId) {
        return sseService.createEmitter(userId);
    }

    @GetMapping(value = "/api/sse/blogs/{blogId}/metrics/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeBlogMetrics(@PathVariable UUID blogId) {
        return sseService.createBlogMetricsEmitter(blogId);
    }
}
