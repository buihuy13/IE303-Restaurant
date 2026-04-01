package com.CNTTK18.paymentservice.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.CNTTK18.Common.Event.PaymentStatusSyncContract;

@Configuration
public class RabbitMQConfig {
    @Bean
    public MessageConverter paymentMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public TopicExchange paymentStatusExchange() {
        return new TopicExchange(PaymentStatusSyncContract.EXCHANGE);
    }
}
