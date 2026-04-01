package com.CNTTK18.order_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.CNTTK18.Common.Event.PaymentStatusSyncContract;

@Configuration
public class RabbitMQConfig {
    @Bean
    public MessageConverter orderMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public TopicExchange paymentStatusExchange() {
        return new TopicExchange(PaymentStatusSyncContract.EXCHANGE);
    }

    @Bean
    public Queue paymentStatusQueue() {
        return QueueBuilder.durable(PaymentStatusSyncContract.QUEUE).build();
    }

    @Bean
    public Binding paymentStatusBinding() {
        return BindingBuilder.bind(paymentStatusQueue())
                .to(paymentStatusExchange())
                .with(PaymentStatusSyncContract.ROUTING_KEY);
    }
}
