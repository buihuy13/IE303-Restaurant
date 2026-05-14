package com.CNTTK18.review_service.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.review_service.service.DashboardReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/dashboard/reviews")
@RequiredArgsConstructor
public class InternalDashboardReviewController {

    private final DashboardReviewService dashboardReviewService;

    @GetMapping("/rating-distribution")
    public ResponseEntity<Map<Integer, Long>> getGlobalRatingDistribution() {
        return ResponseEntity.ok(dashboardReviewService.getGlobalRatingDistribution());
    }

    @GetMapping("/count-by-restaurant")
    public ResponseEntity<Long> countReviewsByRestaurant(@RequestParam UUID restaurantId) {
        return ResponseEntity.ok(dashboardReviewService.countReviewsByRestaurant(restaurantId));
    }
}
