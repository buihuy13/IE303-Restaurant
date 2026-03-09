package com.CNTTK18.restaurant_service.controller;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

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

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

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
    @CircuitBreaker(name = "create", fallbackMethod = "fallbackMethod")
    @TimeLimiter(name = "create")
    @Retry(name = "create")
    public CompletableFuture<ResponseEntity<ReviewResponse>> createReview(
            @RequestBody @Valid ReviewRequest reviewRequest) {
        return CompletableFuture.supplyAsync(
                () -> new ResponseEntity<>(reviewService.createReview(reviewRequest), HttpStatusCode.valueOf(201)));
    }

    public CompletableFuture<ResponseEntity<MessageResponse>> fallbackMethod(
            ReviewRequest reviewRequest, Throwable ex) {
        System.out.println("Lỗi khi gọi createReview, kích hoạt fallback. Lỗi: " + ex.getMessage());
        return CompletableFuture.completedFuture(ResponseEntity.status(503).body(new MessageResponse(ex.getMessage())));
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
