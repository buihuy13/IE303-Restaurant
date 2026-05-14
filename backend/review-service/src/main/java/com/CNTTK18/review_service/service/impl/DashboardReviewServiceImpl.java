package com.CNTTK18.review_service.service.impl;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.review_service.model.data.ReviewType;
import com.CNTTK18.review_service.repository.ReviewRepository;
import com.CNTTK18.review_service.service.DashboardReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardReviewServiceImpl implements DashboardReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public Map<Integer, Long> getGlobalRatingDistribution() {
        return reviewRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> (int) r.getRating(), Collectors.counting()));
    }

    @Override
    @Transactional(readOnly = true)
    public Long countReviewsByRestaurant(UUID restaurantId) {
        return (long) reviewRepository
                .findByReviewIdAndReviewType(restaurantId, ReviewType.RESTAURANT)
                .size();
    }
}
