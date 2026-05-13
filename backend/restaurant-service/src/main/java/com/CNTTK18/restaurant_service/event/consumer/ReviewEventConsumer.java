package com.CNTTK18.restaurant_service.event.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.Review.RestaurantReviewSummaryUpdatedEvent;
import com.CNTTK18.restaurant_service.service.ResService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReviewEventConsumer {

    private final ResService resService;

    @RabbitListener(queues = "restaurant-service-review-queue")
    public void handleRestaurantReviewSummaryUpdated(RestaurantReviewSummaryUpdatedEvent event) {
        resService.updateReviewSummary(event.getRestaurantId(), event.getRating(), event.getTotalReview());
    }
}