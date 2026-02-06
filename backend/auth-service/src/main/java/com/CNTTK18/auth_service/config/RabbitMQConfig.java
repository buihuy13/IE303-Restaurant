package com.CNTTK18.auth_service.config;

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

    private static final String UPDATE_USER_QUEUE = "UpdateUser_queue";
    private static final String UPDATE_USER_KEY = "UpdateUser";

    private static final String DELETE_USER_QUEUE = "DeleteUser_queue";
    private static final String DELETE_USER_KEY = "DeleteUser";

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
    public Queue updateUserQueue() {
        return buildQueue(UPDATE_USER_QUEUE);
    }

    @Bean
    public Binding updateUserBinding(Queue updateUserQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(updateUserQueue).to(userExchange).with(UPDATE_USER_KEY);
    }

    @Bean
    public Queue deleteUserQueue() {
        return buildQueue(DELETE_USER_QUEUE);
    }

    @Bean
    public Binding deleteUserBinding(Queue deleteUserQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(deleteUserQueue).to(userExchange).with(DELETE_USER_KEY);
    }

    private Queue buildQueue(String queueName) {
        return QueueBuilder.durable(queueName)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLX_KEY)
                .build();
    }
}
