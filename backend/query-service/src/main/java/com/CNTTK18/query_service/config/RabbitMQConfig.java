package com.CNTTK18.query_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "rabbitmq.enabled", havingValue = "true", matchIfMissing = false)
public class RabbitMQConfig {

    @Bean
    public TopicExchange domainEventsExchange() {
        return new TopicExchange("domain-events");
    }

    @Bean
    public Queue productQueue() {
        return new Queue("query-service-product-queue", true);
    }

    @Bean
    public Queue restaurantQueue() {
        return new Queue("query-service-restaurant-queue", true);
    }

    @Bean
    public Binding productBinding() {
        return BindingBuilder.bind(productQueue()).to(domainEventsExchange()).with("product.*");
    }

    @Bean
    public Binding restaurantBinding() {
        return BindingBuilder.bind(restaurantQueue()).to(domainEventsExchange()).with("restaurant.*");
    }

    @Bean
    public MessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
