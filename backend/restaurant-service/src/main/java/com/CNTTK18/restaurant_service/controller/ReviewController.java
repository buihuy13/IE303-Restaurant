package com.CNTTK18.restaurant_service.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.response.MessageResponse;
import com.CNTTK18.restaurant_service.dto.review.request.ReviewRequest;
import com.CNTTK18.restaurant_service.dto.review.response.ReviewResponse;
import com.CNTTK18.restaurant_service.service.ReviewService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @Tag(name = "Get")
    @Operation(summary = "Get all reviews")
    @GetMapping("")
    public ResponseEntity<List<ReviewResponse>> getAllReviews(
            @RequestParam(required = false) UUID resId, @RequestParam(required = false) UUID productId) {
        return ResponseEntity.ok(reviewService.getAllReviews(resId, productId));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get review by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable UUID id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @Tag(name = "Post")
    @Operation(summary = "Create new review")
    @PostMapping("")
    public ResponseEntity<ReviewResponse> createReview(@RequestBody @Valid ReviewRequest reviewRequest) {
        return new ResponseEntity<>(reviewService.createReview(reviewRequest), HttpStatusCode.valueOf(201));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete a review")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteReview(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        reviewService.deleteReview(id, authUser);
        return ResponseEntity.ok(new MessageResponse("Delete Successfully"));
    }
}
