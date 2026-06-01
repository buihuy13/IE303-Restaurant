package com.CNTTK18.query_service.event.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.Product.ProductCreatedEvent;
import com.CNTTK18.Common.Event.Product.ProductDeletedEvent;
import com.CNTTK18.Common.Event.Product.ProductUpdatedEvent;
import com.CNTTK18.query_service.event.handler.ProductEventHandler;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductEventConsumer {

    private final ProductEventHandler eventHandler;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "query-service-product-queue")
    public void handleProductEvent(String message, org.springframework.amqp.core.Message amqpMessage) {
        try {
            String routingKey = amqpMessage.getMessageProperties().getReceivedRoutingKey();

            switch (routingKey) {
                case "product.created":
                    ProductCreatedEvent createdEvent = objectMapper.readValue(message, ProductCreatedEvent.class);
                    eventHandler.handleProductCreated(createdEvent);
                    break;
                case "product.updated":
                    ProductUpdatedEvent updatedEvent = objectMapper.readValue(message, ProductUpdatedEvent.class);
                    eventHandler.handleProductUpdated(updatedEvent);
                    break;
                case "product.deleted":
                    ProductDeletedEvent deletedEvent = objectMapper.readValue(message, ProductDeletedEvent.class);
                    eventHandler.handleProductDeleted(deletedEvent);
                    break;
                default:
                    log.warn("Unknown routing key: {}", routingKey);
            }
        } catch (Exception e) {
            log.error("Error processing product event: {}", e.getMessage(), e);
        }
    }
}
