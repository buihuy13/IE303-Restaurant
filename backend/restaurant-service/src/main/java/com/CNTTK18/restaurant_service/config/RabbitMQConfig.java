package com.CNTTK18.restaurant_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class RabbitMQConfig {

    @Bean
    public TopicExchange domainEventsExchange() {
        return new TopicExchange("domain-events");
    }

    @Bean
    public Queue reviewSummaryQueue() {
        return new Queue("restaurant-service-review-queue", true);
    }

    @Bean
    public Binding reviewSummaryBinding() {
        return BindingBuilder.bind(reviewSummaryQueue())
                .to(domainEventsExchange())
                .with("review.restaurant.summary.updated");
    }

    @Bean
    public MessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
