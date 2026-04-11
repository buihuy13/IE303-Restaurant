package com.CNTTK18.restaurant_service.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.restaurant.request.Coordinates;
import com.CNTTK18.restaurant_service.dto.restaurant.request.ResQuery;
import com.CNTTK18.restaurant_service.dto.restaurant.request.ResRequest;
import com.CNTTK18.restaurant_service.dto.restaurant.request.UpdateRes;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.model.Restaurants;

public interface ResService {

    public Page<ResResponse> getAllRestaurants(Coordinates location, ResQuery resQuery, Pageable pageable);

    public ResResponse getRestaurantById(UUID id, Coordinates location);

    public ResResponse getRestaurantBySlug(String slug);

    public Restaurants createRestaurant(ResRequest resRequest, MultipartFile imageFile, UserRole authUser);

    public ResResponse updateRestaurant(UUID id, UpdateRes updateRes, MultipartFile imageFile, UserRole authUser);

    public void deleteRestaurant(UUID id, UserRole authUser);

    public void changeResStatus(UUID id);

    public void deleteImage(UUID resId, UserRole authUser);

    public ResResponse getRestaurantsByMerchantId(UUID id);
}
