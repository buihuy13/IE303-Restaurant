package com.CNTTK18.restaurant_service.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.response.MessageResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.request.ResRequest;
import com.CNTTK18.restaurant_service.dto.restaurant.request.UpdateRes;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.service.ResService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/restaurant")
@RequiredArgsConstructor
public class ResController {
    private final ResService resService;

    @Tag(name = "Get")
    @Operation(summary = "Get restaurant by ID")
    @GetMapping("/admin/{id}")
    public ResponseEntity<ResResponse> getRestaurantById(@PathVariable UUID id) {
        return ResponseEntity.ok(resService.getRestaurantById(id));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get restaurant by Slug")
    @GetMapping("/{slug}")
    public ResponseEntity<ResResponse> getRestaurantBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(resService.getRestaurantBySlug(slug));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get all restaurants with pagination")
    @GetMapping()
    public ResponseEntity<Page<ResResponse>> getAllRestaurants(Pageable pageable) {
        return ResponseEntity.ok(resService.getAllRestaurants(pageable));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get restaurants by merchant id")
    @GetMapping("/merchant/{id}")
    public ResponseEntity<ResResponse> getRestaurantByMerchantId(@PathVariable UUID id) {
        return ResponseEntity.ok(resService.getRestaurantsByMerchantId(id));
    }

    @Tag(name = "Put")
    @Operation(summary = "Update restaurant")
    @PutMapping("/{id}")
    public ResponseEntity<ResResponse> updateRestaurant(
            @PathVariable UUID id,
            @RequestPart(value = "restaurant", required = true) @Valid UpdateRes updateRes,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(resService.updateRestaurant(id, updateRes, imageFile, authUser));
    }

    @Tag(name = "Post")
    @Operation(summary = "Create new restaurant")
    @PostMapping()
    public ResponseEntity<Restaurants> createRestaurant(
            @RequestPart(value = "restaurant", required = true) @Valid ResRequest resRequest,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(resService.createRestaurant(resRequest, imageFile, authUser));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete a restaurant")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteRes(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        resService.deleteRestaurant(id, authUser);
        return ResponseEntity.ok(new MessageResponse("Delete Successfully"));
    }

    @Tag(name = "Put")
    @Operation(summary = "Update restaurant enabled status")
    @PutMapping("/enable/{id}")
    public ResponseEntity<MessageResponse> updateRestaurantEnable(@PathVariable UUID id) {
        resService.changeResStatus(id);
        return ResponseEntity.ok(new MessageResponse("Update status successfully"));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete restaurant image")
    @DeleteMapping("/image/{id}")
    public ResponseEntity<MessageResponse> deleteResImage(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        resService.deleteImage(id, authUser);
        return ResponseEntity.ok(new MessageResponse("Delete image successfully"));
    }
}
