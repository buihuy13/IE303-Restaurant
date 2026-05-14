package com.CNTTK18.restaurant_service.service.Impl;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.restaurant_service.client.feign.ImageServiceFeignClient;
import com.CNTTK18.restaurant_service.client.feign.UserServiceFeignClient;
import com.CNTTK18.restaurant_service.client.feign.dto.ImageUploadResponse;
import com.CNTTK18.restaurant_service.client.feign.dto.UserResponse;
import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.restaurant.request.ResRequest;
import com.CNTTK18.restaurant_service.dto.restaurant.request.UpdateRes;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.event.publisher.RestaurantEventPublisher;
import com.CNTTK18.restaurant_service.exception.ForbiddenException;
import com.CNTTK18.restaurant_service.exception.InvalidRequestException;
import com.CNTTK18.restaurant_service.mapper.ResMapper;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.repository.ResRepository;
import com.CNTTK18.restaurant_service.service.ResService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResServiceImpl implements ResService {
    private final ResRepository resRepository;
    private final UserServiceFeignClient userServiceClient;
    private final ImageServiceFeignClient imageServiceClient;
    private final ResMapper resMapper;
    private final RestaurantEventPublisher eventPublisher;

    @Override
    public ResResponse getRestaurantById(UUID id) {
        Restaurants res = getById(id);
        return resMapper.toResResponse(res);
    }

    @Override
    public ResResponse getRestaurantBySlug(String slug) {
        Restaurants res =
                resRepository.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        return resMapper.toResResponse(res);
    }

    @Transactional
    @Override
    public Restaurants createRestaurant(ResRequest resRequest, MultipartFile imageFile, UserRole authUser) {
        UserResponse user = userServiceClient.getAdminUser(resRequest.getMerchantId());

        validateMerchant(user, authUser);
        Restaurants res = buildRestaurant(resRequest);

        Restaurants savedRes = saveRestaurant(res, imageFile);

        eventPublisher.publishRestaurantCreated(
                savedRes.getId(),
                savedRes.getResName(),
                savedRes.getSlug(),
                savedRes.getAddress(),
                savedRes.getPhone(),
                savedRes.getImageURL(),
                savedRes.isEnabled(),
                savedRes.getOpeningTime().toString(),
                savedRes.getClosingTime().toString(),
                savedRes.getLatitude(),
                savedRes.getLongitude(),
                savedRes.getRating(),
                savedRes.getTotalReview(),
                savedRes.getMerchantId(),
                savedRes.getCreatedAt());

        return savedRes;
    }

    @Transactional
    @Override
    public ResResponse updateRestaurant(UUID id, UpdateRes updateRes, MultipartFile imageFile, UserRole authUser) {
        Restaurants res = getById(id);

        checkAuthority(res.getMerchantId(), authUser);
        res.setAddress(updateRes.getAddress());
        res.setOpeningTime(updateRes.getOpeningTime());
        res.setClosingTime(updateRes.getClosingTime());
        res.setPhone(updateRes.getPhone());
        res.setLongitude(updateRes.getLongitude());
        res.setLatitude(updateRes.getLatitude());
        if (!res.getResName().equals(updateRes.getResName())) {
            res.setResName(updateRes.getResName());
            res.setSlug(SlugGenerator.generate(updateRes.getResName()));
        }
        if (imageFile != null && !imageFile.isEmpty()) {
            String oldPublicId = res.getPublicID();
            ImageUploadResponse image = imageServiceClient.uploadImage(imageFile, "restaurant");
            res.setImageURL(image.getUrl());
            res.setPublicID(image.getPublic_id());
            if (oldPublicId != null && !oldPublicId.isEmpty()) {
                imageServiceClient.deleteImage(oldPublicId);
            }
        }

        Restaurants savedRes = resRepository.save(res);

        eventPublisher.publishRestaurantUpdated(
                savedRes.getId(),
                savedRes.getResName(),
                savedRes.getSlug(),
                savedRes.getAddress(),
                savedRes.getPhone(),
                savedRes.getImageURL(),
                savedRes.isEnabled(),
                savedRes.getOpeningTime().toString(),
                savedRes.getClosingTime().toString(),
                savedRes.getLatitude(),
                savedRes.getLongitude(),
                savedRes.getRating(),
                savedRes.getTotalReview(),
                savedRes.getUpdatedAt());

        return resMapper.toResResponse(savedRes);
    }

    @Override
    @Transactional
    public void deleteRestaurant(UUID id, UserRole authUser) {
        Restaurants res = getById(id);
        UUID merchantId = res.getMerchantId();
        checkAuthority(merchantId, authUser);

        if (res.getPublicID() != null && !res.getPublicID().isEmpty()) {
            imageServiceClient.deleteImage(res.getPublicID());
        }
        resRepository.delete(res);
        eventPublisher.publishRestaurantDeleted(id, merchantId, Instant.now());
    }

    @Override
    @Transactional
    public void changeResStatus(UUID id) {
        Restaurants res = getById(id);
        res.setEnabled(!res.isEnabled());
        Restaurants savedRes = resRepository.save(res);

        eventPublisher.publishRestaurantUpdated(
                savedRes.getId(),
                savedRes.getResName(),
                savedRes.getSlug(),
                savedRes.getAddress(),
                savedRes.getPhone(),
                savedRes.getImageURL(),
                savedRes.isEnabled(),
                savedRes.getOpeningTime().toString(),
                savedRes.getClosingTime().toString(),
                savedRes.getLatitude(),
                savedRes.getLongitude(),
                savedRes.getRating(),
                savedRes.getTotalReview(),
                savedRes.getUpdatedAt());
    }

    @Override
    @Transactional
    public void deleteImage(UUID resId, UserRole authUser) {
        Restaurants res = getById(resId);

        checkAuthority(res.getMerchantId(), authUser);
        imageServiceClient.deleteImage(res.getPublicID());
        res.setImageURL(null);
        res.setPublicID(null);
        Restaurants savedRes = resRepository.save(res);

        eventPublisher.publishRestaurantUpdated(
                savedRes.getId(),
                savedRes.getResName(),
                savedRes.getSlug(),
                savedRes.getAddress(),
                savedRes.getPhone(),
                savedRes.getImageURL(),
                savedRes.isEnabled(),
                savedRes.getOpeningTime().toString(),
                savedRes.getClosingTime().toString(),
                savedRes.getLatitude(),
                savedRes.getLongitude(),
                savedRes.getRating(),
                savedRes.getTotalReview(),
                savedRes.getUpdatedAt());
    }

    @Override
    @Transactional
    public void updateReviewSummary(UUID id, float rating, int totalReview) {
        Restaurants res = getById(id);
        res.setRating(rating);
        res.setTotalReview(totalReview);
        Restaurants savedRes = resRepository.save(res);

        eventPublisher.publishRestaurantUpdated(
                savedRes.getId(),
                savedRes.getResName(),
                savedRes.getSlug(),
                savedRes.getAddress(),
                savedRes.getPhone(),
                savedRes.getImageURL(),
                savedRes.isEnabled(),
                savedRes.getOpeningTime().toString(),
                savedRes.getClosingTime().toString(),
                savedRes.getLatitude(),
                savedRes.getLongitude(),
                savedRes.getRating(),
                savedRes.getTotalReview(),
                savedRes.getUpdatedAt());
    }

    @Override
    public ResResponse getRestaurantsByMerchantId(UUID id) {
        UserResponse user = userServiceClient.getAdminUser(id);

        Restaurants res = resRepository
                .findRestaurantsByMerchantId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        return resMapper.toResResponse(res);
    }

    private Restaurants getById(UUID id) {
        Restaurants res =
                resRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        return res;
    }

    private void checkAuthority(UUID id, UserRole authUser) {
        if (authUser != null && !authUser.getId().equals(id) && !"ADMIN".equals(authUser.getRole())) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }

    private void validateMerchant(UserResponse user, UserRole authUser) {
        if (user == null) throw new ResourceNotFoundException("Không tồn tại user");
        if (authUser == null) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }

        boolean isAdmin = "ADMIN".equals(authUser.getRole());
        boolean isMerchantOwner =
                "MERCHANT".equals(authUser.getRole()) && user.getId().equals(authUser.getId());

        if (!isAdmin && !isMerchantOwner) {
            throw new InvalidRequestException("User không phải là merchant hay admin");
        }
        if (resRepository.findRestaurantsByMerchantId(user.getId()).isPresent()) {
            throw new InvalidRequestException("User đã là merchant của 1 restaurant");
        }
    }

    private Restaurants buildRestaurant(ResRequest resRequest) {
        return Restaurants.builder()
                .address(resRequest.getAddress())
                .closingTime(resRequest.getClosingTime())
                .enabled(false)
                .id(UUID.randomUUID())
                .merchantId(resRequest.getMerchantId())
                .openingTime(resRequest.getOpeningTime())
                .phone(resRequest.getPhone())
                .resName(resRequest.getResName())
                .longitude(resRequest.getLongitude())
                .latitude(resRequest.getLatitude())
                .slug(SlugGenerator.generate(resRequest.getResName()))
                .build();
    }

    @Transactional
    private Restaurants saveRestaurant(Restaurants res, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            ImageUploadResponse image = imageServiceClient.uploadImage(imageFile, "restaurant");
            res.setImageURL(image.getUrl());
            res.setPublicID(image.getPublic_id());
        }
        return resRepository.save(res);
    }
}
