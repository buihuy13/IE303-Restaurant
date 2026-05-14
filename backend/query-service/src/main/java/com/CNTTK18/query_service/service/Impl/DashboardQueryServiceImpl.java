package com.CNTTK18.query_service.service.Impl;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.CNTTK18.query_service.repository.ProductReadModelRepository;
import com.CNTTK18.query_service.repository.RestaurantReadModelRepository;
import com.CNTTK18.query_service.service.DashboardQueryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardQueryServiceImpl implements DashboardQueryService {

    private final RestaurantReadModelRepository restaurantRepository;
    private final ProductReadModelRepository productRepository;

    @Override
    public long countRestaurants() {
        return restaurantRepository.count();
    }

    @Override
    public long countProducts() {
        return productRepository.count();
    }

    @Override
    public long countProductsByRestaurant(UUID restaurantId) {
        return productRepository.countByRestaurantId(restaurantId);
    }

    @Override
    public Double getAverageRestaurantRating() {
        return restaurantRepository.findAverageRating().orElse(0.0);
    }

    @Override
    public Double getAverageProductRating() {
        return productRepository.findAverageRating().orElse(0.0);
    }

    @Override
    public long countTotalReviews() {
        Long restaurantReviews = restaurantRepository.findTotalReviews().orElse(0L);
        Long productReviews = productRepository.findTotalReviews().orElse(0L);
        return restaurantReviews + productReviews;
    }

    @Override
    public Long countReviewsByRestaurant(UUID restaurantId) {
        return restaurantRepository
                .findById(restaurantId)
                .map(r -> r.getReviewCount() != null ? (long) r.getReviewCount() : 0L)
                .orElse(0L);
    }
}
