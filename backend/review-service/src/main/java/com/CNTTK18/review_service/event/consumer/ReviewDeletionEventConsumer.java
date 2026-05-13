package com.CNTTK18.review_service.event.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Event.Product.ProductDeletedEvent;
import com.CNTTK18.Common.Event.Restaurant.RestaurantDeletedEvent;
import com.CNTTK18.review_service.model.data.ReviewType;
import com.CNTTK18.review_service.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReviewDeletionEventConsumer {

    private final ReviewRepository reviewRepository;

    @RabbitListener(queues = "review-service-product-deleted-queue")
    @Transactional
    public void handleProductDeleted(ProductDeletedEvent event) {
        reviewRepository.deleteByReviewIdAndReviewType(event.getId(), ReviewType.PRODUCT);
    }

    @RabbitListener(queues = "review-service-restaurant-deleted-queue")
    @Transactional
    public void handleRestaurantDeleted(RestaurantDeletedEvent event) {
        reviewRepository.deleteByReviewIdAndReviewType(event.getId(), ReviewType.RESTAURANT);
    }
}