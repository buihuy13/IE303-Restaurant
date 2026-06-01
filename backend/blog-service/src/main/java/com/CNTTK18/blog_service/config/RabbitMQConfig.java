package com.CNTTK18.blog_service.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.CNTTK18.Common.Event.BlogMetricsContract;

@Configuration
public class RabbitMQConfig {
    @Bean
    public MessageConverter blogMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public TopicExchange blogMetricsExchange() {
        return new TopicExchange(BlogMetricsContract.EXCHANGE);
    }
}
