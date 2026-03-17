package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.restaurant.request.Coordinates;
import com.CNTTK18.restaurant_service.dto.restaurant.request.ResRequest;
import com.CNTTK18.restaurant_service.dto.restaurant.request.UpdateRes;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.model.Restaurants;

public interface ResService {

    public ResResponse getRestaurantById(UUID id, Coordinates location);

    public ResResponse getRestaurantBySlug(String slug);

    public Restaurants createRestaurant(ResRequest resRequest, MultipartFile imageFile, UserRole authUser);

    public ResResponse updateRestaurant(UUID id, UpdateRes updateRes, MultipartFile imageFile, UserRole authUser);

    public void deleteRestaurant(UUID id, UserRole authUser);

    public void changeResStatus(UUID id);

    public void deleteImage(UUID resId, UserRole authUser);

    public List<ResResponse> getRestaurantsByMerchantId(UUID id);
}
