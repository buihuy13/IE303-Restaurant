package com.CNTTK18.notification_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Event.BlogMetricsContract;
import com.CNTTK18.Common.Event.BlogMetricsEvent;

@Service
public class BlogMetricsConsumer {
    private static final Logger log = LoggerFactory.getLogger(BlogMetricsConsumer.class);

    private final SSEService sseService;

    public BlogMetricsConsumer(SSEService sseService) {
        this.sseService = sseService;
    }

    @RabbitListener(queues = BlogMetricsContract.QUEUE)
    public void consume(BlogMetricsEvent event) {
        if (event == null || event.getBlogId() == null) {
            log.warn("Skip invalid blog metrics event: {}", event);
            return;
        }

        sseService.sendBlogMetrics(event);
    }
}
