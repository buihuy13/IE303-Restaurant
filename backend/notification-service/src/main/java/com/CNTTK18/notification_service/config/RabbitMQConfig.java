package com.CNTTK18.notification_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.CNTTK18.Common.Event.BlogMetricsContract;
import com.CNTTK18.Common.Event.OrderNotificationContract;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class RabbitMQConfig {
    // Dead letter
    private static final String DLX_EXCHANGE = "dead_letter_exchange";
    private static final String DLX_QUEUE = "dead_letter_queue";
    private static final String DLX_KEY = "dead_letter_routingKey";

    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        // Cấu hình bỏ qua lỗi khi gặp field lạ
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    Queue confirmationQueue() {
        return QueueBuilder.durable("Confirmation_queue")
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLX_KEY)
                .build();
    }

    @Bean
    TopicExchange confirmationExchange() {
        return new TopicExchange("Confirmation_exchange");
    }

    @Bean
    Binding confirmationBinding() {
        return BindingBuilder.bind(confirmationQueue())
                .to(confirmationExchange())
                .with("Confirmation");
    }

    @Bean
    Queue orderNotificationQueue() {
        return QueueBuilder.durable(OrderNotificationContract.QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLX_KEY)
                .build();
    }

    @Bean
    TopicExchange orderNotificationExchange() {
        return new TopicExchange(OrderNotificationContract.EXCHANGE);
    }

    @Bean
    Binding orderNotificationBinding() {
        return BindingBuilder.bind(orderNotificationQueue())
                .to(orderNotificationExchange())
                .with(OrderNotificationContract.ROUTING_KEY);
    }

    @Bean
    Queue blogMetricsQueue() {
        return QueueBuilder.durable(BlogMetricsContract.QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLX_KEY)
                .build();
    }

    @Bean
    TopicExchange blogMetricsExchange() {
        return new TopicExchange(BlogMetricsContract.EXCHANGE);
    }

    @Bean
    Binding blogMetricsBinding() {
        return BindingBuilder.bind(blogMetricsQueue()).to(blogMetricsExchange()).with(BlogMetricsContract.ROUTING_KEY);
    }

    @Bean
    DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX_EXCHANGE);
    }

    @Bean
    Queue deadLetterQueue() {
        return new Queue(DLX_QUEUE, true);
    }

    @Bean
    Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with(DLX_KEY);
    }
}
