package com.CNTTK18.product_service.event.publisher;

import java.time.Instant;
import java.util.UUID;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.Product.ProductCreatedEvent;
import com.CNTTK18.Common.Event.Product.ProductDeletedEvent;
import com.CNTTK18.Common.Event.Product.ProductUpdatedEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProductEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE = "domain-events";

    public void publishProductCreated(
            UUID id,
            String productName,
            UUID restaurantId,
            UUID categoryId,
            String slug,
            String description,
            boolean available,
            Double minPrice,
            Double maxPrice,
            String imageUrl,
            Instant createdAt) {
        ProductCreatedEvent event = ProductCreatedEvent.builder()
                .id(id)
                .productName(productName)
                .restaurantId(restaurantId)
                .categoryId(categoryId)
                .slug(slug)
                .description(description)
                .available(available)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .imageUrl(imageUrl)
                .rating(0f)
                .totalReview(0)
                .createdAt(createdAt)
                .build();
        rabbitTemplate.convertAndSend(EXCHANGE, "product.created", event);
    }

    public void publishProductUpdated(
            UUID id,
            String productName,
            UUID restaurantId,
            UUID categoryId,
            String slug,
            boolean available,
            Double minPrice,
            Double maxPrice,
            String imageUrl,
            Instant updatedAt) {
        ProductUpdatedEvent event = ProductUpdatedEvent.builder()
                .id(id)
                .productName(productName)
                .restaurantId(restaurantId)
                .categoryId(categoryId)
                .slug(slug)
                .available(available)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .imageUrl(imageUrl)
                .updatedAt(updatedAt)
                .build();
        rabbitTemplate.convertAndSend(EXCHANGE, "product.updated", event);
    }

    public void publishProductDeleted(UUID id, UUID restaurantId, Instant deletedAt) {
        ProductDeletedEvent event = ProductDeletedEvent.builder()
                .id(id)
                .restaurantId(restaurantId)
                .deletedAt(deletedAt)
                .build();
        rabbitTemplate.convertAndSend(EXCHANGE, "product.deleted", event);
    }
}
