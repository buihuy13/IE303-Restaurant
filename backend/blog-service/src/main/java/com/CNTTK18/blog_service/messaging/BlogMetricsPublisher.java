package com.CNTTK18.blog_service.messaging;

import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.BlogMetricsContract;
import com.CNTTK18.Common.Event.BlogMetricsEvent;
import com.CNTTK18.blog_service.dto.response.BlogMetricsResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class BlogMetricsPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publish(BlogMetricsResponse metrics) {
        if (metrics == null || metrics.getBlogId() == null) {
            return;
        }

        BlogMetricsEvent event = new BlogMetricsEvent(
                metrics.getBlogId(), metrics.getViewsCount(), metrics.getLikesCount(), metrics.getCommentsCount());

        try {
            rabbitTemplate.convertAndSend(BlogMetricsContract.EXCHANGE, BlogMetricsContract.ROUTING_KEY, event);
            log.info("[BlogMetrics] Published: blogId={}", event.getBlogId());
        } catch (AmqpException ex) {
            log.warn("[BlogMetrics] Failed to publish blog metrics for blogId={}", event.getBlogId(), ex);
        }
    }
}
