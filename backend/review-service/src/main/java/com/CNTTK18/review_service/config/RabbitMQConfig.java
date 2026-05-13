package com.CNTTK18.review_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange domainEventsExchange() {
        return new TopicExchange("domain-events");
    }

    @Bean
    public Queue productDeletedQueue() {
        return new Queue("review-service-product-deleted-queue", true);
    }

    @Bean
    public Queue restaurantDeletedQueue() {
        return new Queue("review-service-restaurant-deleted-queue", true);
    }

    @Bean
    public Binding productDeletedBinding() {
        return BindingBuilder.bind(productDeletedQueue()).to(domainEventsExchange()).with("product.deleted");
    }

    @Bean
    public Binding restaurantDeletedBinding() {
        return BindingBuilder.bind(restaurantDeletedQueue()).to(domainEventsExchange()).with("restaurant.deleted");
    }

    @Bean
    public MessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }
}