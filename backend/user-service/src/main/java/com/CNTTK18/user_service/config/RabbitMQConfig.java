package com.CNTTK18.user_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class RabbitMQConfig {

    private static final String DLX_EXCHANGE = "dead_letter_exchange";
    private static final String DLX_QUEUE = "dead_letter_queue";
    private static final String DLX_KEY = "dead_letter_routingKey";

    private static final String USER_EXCHANGE = "User_exchange";

    private static final String CREATE_USER_QUEUE = "CreateUser_queue";
    private static final String CREATE_USER_KEY = "CreateUser";

    private final ObjectMapper objectMapper;

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX_EXCHANGE);
    }

    @Bean
    public Queue deadLetterQueue() {
        return new Queue(DLX_QUEUE, true);
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with(DLX_KEY);
    }

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public Queue createUserQueue() {
        return buildQueue(CREATE_USER_QUEUE);
    }

    @Bean
    public Binding createUserBinding(Queue createUserQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(createUserQueue()).to(userExchange).with(CREATE_USER_KEY);
    }

    private Queue buildQueue(String queueName) {
        return QueueBuilder.durable(queueName)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLX_KEY)
                .build();
    }
}
