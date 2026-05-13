package com.CNTTK18.restaurant_service.event.publisher;

import java.time.Instant;
import java.util.UUID;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.Restaurant.RestaurantCreatedEvent;
import com.CNTTK18.Common.Event.Restaurant.RestaurantDeletedEvent;
import com.CNTTK18.Common.Event.Restaurant.RestaurantUpdatedEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RestaurantEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE = "domain-events";

    public void publishRestaurantCreated(
            UUID id,
            String name,
            String slug,
            String address,
            String phone,
            String imageUrl,
            boolean enabled,
            String openingTime,
            String closingTime,
            Double latitude,
            Double longitude,
            float rating,
            int totalReview,
            UUID merchantId,
            Instant createdAt) {
        RestaurantCreatedEvent event = RestaurantCreatedEvent.builder()
                .id(id)
                .name(name)
                .slug(slug)
                .address(address)
                .phone(phone)
                .imageUrl(imageUrl)
                .enabled(enabled)
                .openingTime(openingTime)
                .closingTime(closingTime)
                .latitude(latitude)
                .longitude(longitude)
                .rating(rating)
                .totalReview(totalReview)
                .merchantId(merchantId)
                .createdAt(createdAt)
                .build();
        rabbitTemplate.convertAndSend(EXCHANGE, "restaurant.created", event);
    }

    public void publishRestaurantUpdated(
            UUID id,
            String name,
            String slug,
            String address,
            String phone,
            String imageUrl,
            boolean enabled,
            String openingTime,
            String closingTime,
            Double latitude,
            Double longitude,
            float rating,
            int totalReview,
            Instant updatedAt) {
        RestaurantUpdatedEvent event = RestaurantUpdatedEvent.builder()
                .id(id)
                .name(name)
                .slug(slug)
                .address(address)
                .phone(phone)
                .imageUrl(imageUrl)
                .enabled(enabled)
                .openingTime(openingTime)
                .closingTime(closingTime)
                .latitude(latitude)
                .longitude(longitude)
                .rating(rating)
                .totalReview(totalReview)
                .updatedAt(updatedAt)
                .build();
        rabbitTemplate.convertAndSend(EXCHANGE, "restaurant.updated", event);
    }

    public void publishRestaurantDeleted(UUID id, UUID merchantId, Instant deletedAt) {
        RestaurantDeletedEvent event = RestaurantDeletedEvent.builder()
                .id(id)
                .merchantId(merchantId)
                .deletedAt(deletedAt)
                .build();
        rabbitTemplate.convertAndSend(EXCHANGE, "restaurant.deleted", event);
    }
}
