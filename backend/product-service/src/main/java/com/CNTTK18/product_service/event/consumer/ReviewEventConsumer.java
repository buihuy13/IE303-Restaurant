package com.CNTTK18.product_service.event.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Event.Review.ProductReviewSummaryUpdatedEvent;
import com.CNTTK18.product_service.service.ProductService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReviewEventConsumer {

    private final ProductService productService;

    @RabbitListener(queues = "product-service-review-queue")
    public void handleProductReviewSummaryUpdated(ProductReviewSummaryUpdatedEvent event) {
        productService.updateReviewSummary(event.getProductId(), event.getRating(), event.getTotalReview());
    }
}