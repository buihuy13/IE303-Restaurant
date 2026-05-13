package com.CNTTK18.review_service.event.publisher;

import java.time.Instant;
import java.util.UUID;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.Review.ProductReviewSummaryUpdatedEvent;
import com.CNTTK18.Common.Event.Review.RestaurantReviewSummaryUpdatedEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReviewEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE = "domain-events";

    public void publishProductReviewSummaryUpdated(UUID productId, float rating, int totalReview) {
        ProductReviewSummaryUpdatedEvent event = ProductReviewSummaryUpdatedEvent.builder()
                .productId(productId)
                .rating(rating)
                .totalReview(totalReview)
                .updatedAt(Instant.now())
                .build();
        rabbitTemplate.convertAndSend(EXCHANGE, "review.product.summary.updated", event);
    }

    public void publishRestaurantReviewSummaryUpdated(UUID restaurantId, float rating, int totalReview) {
        RestaurantReviewSummaryUpdatedEvent event = RestaurantReviewSummaryUpdatedEvent.builder()
                .restaurantId(restaurantId)
                .rating(rating)
                .totalReview(totalReview)
                .updatedAt(Instant.now())
                .build();
        rabbitTemplate.convertAndSend(EXCHANGE, "review.restaurant.summary.updated", event);
    }
}