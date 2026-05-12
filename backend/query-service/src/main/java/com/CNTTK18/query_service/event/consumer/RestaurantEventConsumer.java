package com.CNTTK18.query_service.event.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.Restaurant.RestaurantCreatedEvent;
import com.CNTTK18.Common.Event.Restaurant.RestaurantDeletedEvent;
import com.CNTTK18.Common.Event.Restaurant.RestaurantUpdatedEvent;
import com.CNTTK18.query_service.event.handler.RestaurantEventHandler;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@ConditionalOnProperty(name = "rabbitmq.enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
public class RestaurantEventConsumer {

    private final RestaurantEventHandler eventHandler;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "query-service-restaurant-queue")
    public void handleRestaurantEvent(String message, org.springframework.amqp.core.Message amqpMessage) {
        try {
            String routingKey = amqpMessage.getMessageProperties().getReceivedRoutingKey();

            switch (routingKey) {
                case "restaurant.created":
                    RestaurantCreatedEvent createdEvent = objectMapper.readValue(message, RestaurantCreatedEvent.class);
                    eventHandler.handleRestaurantCreated(createdEvent);
                    break;
                case "restaurant.updated":
                    RestaurantUpdatedEvent updatedEvent = objectMapper.readValue(message, RestaurantUpdatedEvent.class);
                    eventHandler.handleRestaurantUpdated(updatedEvent);
                    break;
                case "restaurant.deleted":
                    RestaurantDeletedEvent deletedEvent = objectMapper.readValue(message, RestaurantDeletedEvent.class);
                    eventHandler.handleRestaurantDeleted(deletedEvent);
                    break;
                default:
                    log.warn("Unknown routing key: {}", routingKey);
            }
        } catch (Exception e) {
            log.error("Error processing restaurant event: {}", e.getMessage(), e);
        }
    }
}
