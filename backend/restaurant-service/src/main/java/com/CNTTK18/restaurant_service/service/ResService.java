package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.restaurant.request.Coordinates;
import com.CNTTK18.restaurant_service.dto.restaurant.request.ResRequest;
import com.CNTTK18.restaurant_service.dto.restaurant.request.UpdateRes;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponseWithProduct;
import com.CNTTK18.restaurant_service.model.Restaurants;

import reactor.core.publisher.Mono;

public interface ResService {
    public Mono<Page<ResResponseWithProduct>> getAllRestaurants(
            Coordinates location, String search, Integer nearby, String rating, String category, Pageable pageable);

    public Mono<ResResponseWithProduct> getRestaurantById(UUID id, Coordinates location);

    public ResResponseWithProduct getRestaurantBySlug(String slug);

    public Mono<Restaurants> createRestaurant(ResRequest resRequest, MultipartFile imageFile, UserRole authUser);

    public ResResponseWithProduct updateRestaurant(
            UUID id, UpdateRes updateRes, MultipartFile imageFile, UserRole authUser);

    public void deleteRestaurant(UUID id, UserRole authUser);

    public void changeResStatus(UUID id);

    public void deleteImage(UUID resId, UserRole authUser);

    public List<ResResponseWithProduct> getRestaurantsByMerchantId(UUID id);
}
