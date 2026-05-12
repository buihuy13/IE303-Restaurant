package com.CNTTK18.query_service.event.handler;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Event.Product.ProductCreatedEvent;
import com.CNTTK18.Common.Event.Product.ProductDeletedEvent;
import com.CNTTK18.Common.Event.Product.ProductUpdatedEvent;
import com.CNTTK18.query_service.model.ProductReadModel;
import com.CNTTK18.query_service.repository.ProductReadModelRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProductEventHandler {
    private final ProductReadModelRepository productRepository;

    @Transactional
    public void handleProductCreated(ProductCreatedEvent event) {
        ProductReadModel model = ProductReadModel.builder()
                .id(event.getId())
                .name(event.getProductName())
                .slug(event.getSlug())
                .description(event.getDescription())
                .imageUrl(event.getImageUrl())
                .available(event.isAvailable())
                .categoryId(event.getCategoryId())
                .restaurantId(event.getRestaurantId())
                .minPrice(event.getMinPrice() != null ? BigDecimal.valueOf(event.getMinPrice()) : null)
                .maxPrice(event.getMaxPrice() != null ? BigDecimal.valueOf(event.getMaxPrice()) : null)
                .rating(BigDecimal.valueOf(event.getRating()))
                .reviewCount(event.getTotalReview())
                .createdAt(event.getCreatedAt())
                .updatedAt(Instant.now())
                .build();
        productRepository.save(model);
    }

    @Transactional
    public void handleProductUpdated(ProductUpdatedEvent event) {
        productRepository.findById(event.getId()).ifPresent(model -> {
            model.setName(event.getProductName());
            model.setSlug(event.getSlug());
            model.setUpdatedAt(event.getUpdatedAt());
            if (event.getImageUrl() != null) {
                model.setImageUrl(event.getImageUrl());
            }
            model.setAvailable(event.isAvailable());
            model.setCategoryId(event.getCategoryId());
            model.setMinPrice(event.getMinPrice() != null ? BigDecimal.valueOf(event.getMinPrice()) : null);
            model.setMaxPrice(event.getMaxPrice() != null ? BigDecimal.valueOf(event.getMaxPrice()) : null);
            productRepository.save(model);
        });
    }

    @Transactional
    public void handleProductDeleted(ProductDeletedEvent event) {
        productRepository.deleteById(event.getId());
    }
}
