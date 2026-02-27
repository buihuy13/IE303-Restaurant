package com.CNTTK18.recommendation_service.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.recommendation_service.dto.request.UserContext;
import com.CNTTK18.recommendation_service.dto.response.MessageResponse;
import com.CNTTK18.recommendation_service.service.RecommendationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendationService;

    @Tag(name = "Get")
    @Operation(summary = "Get food recommendations")
    @PostMapping("/food")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'MERCHANT')")
    public ResponseEntity<MessageResponse> getFoodRecommendations(@Valid @RequestBody UserContext userContext) {
        MessageResponse response = recommendationService.recommendFood(userContext.getContext());
        return ResponseEntity.ok(response);
    }

    @Tag(name = "Get")
    @Operation(summary = "Get food descriptions")
    @PostMapping("/descriptions")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<List<MessageResponse>> getFoodDescriptions(@Valid @RequestBody UserContext userContext) {
        List<MessageResponse> response = recommendationService.generateFoodDescription(userContext.getContext());
        return ResponseEntity.ok(response);
    }
}
