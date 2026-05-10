package com.CNTTK18.restaurant_service.service.Impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.restaurant_service.client.feign.ImageServiceFeignClient;
import com.CNTTK18.restaurant_service.client.feign.dto.ImageUploadResponse;
import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.api.UserResponse;
import com.CNTTK18.restaurant_service.dto.distance.response.DistanceResponse;
import com.CNTTK18.restaurant_service.dto.distance.response.OrsDirectionResponse;
import com.CNTTK18.restaurant_service.dto.distance.response.Summary;
import com.CNTTK18.restaurant_service.dto.restaurant.request.Coordinates;
import com.CNTTK18.restaurant_service.dto.restaurant.request.ResQuery;
import com.CNTTK18.restaurant_service.dto.restaurant.request.ResRequest;
import com.CNTTK18.restaurant_service.dto.restaurant.request.UpdateRes;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.exception.DistanceDurationException;
import com.CNTTK18.restaurant_service.exception.ForbiddenException;
import com.CNTTK18.restaurant_service.exception.InvalidRequestException;
import com.CNTTK18.restaurant_service.mapper.ResMapper;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.repository.ResRepository;
import com.CNTTK18.restaurant_service.service.DistanceService;
import com.CNTTK18.restaurant_service.service.ResService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResServiceImpl implements ResService {
    private final ResRepository resRepository;
    private final WebClient.Builder webClientBuilder;
    private final ImageServiceFeignClient imageServiceClient;
    private final DistanceService distanceService;
    private final ResMapper resMapper;

    @Override
    public Page<ResResponse> getAllRestaurants(Coordinates location, ResQuery resQuery, Pageable pageable) {

        Page<Restaurants> res = getRestaurantsAfterValidation(location, resQuery, pageable);
        if (res.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Double> startingPoints = List.of(location.getLongitude(), location.getLatitude());
        List<List<Double>> endPoints = res.stream()
                .map(r -> List.of(r.getLongitude(), r.getLatitude()))
                .toList();

        DistanceResponse response = distanceService.getDistanceAndDurationInList(startingPoints, endPoints);

        List<Double> durations = response.getDurations().get(0);
        List<Double> distances = response.getDistances().get(0);

        List<ResResponse> responseList = IntStream.range(0, res.getContent().size())
                .mapToObj(i -> resMapper.toResResponse(res.getContent().get(i), durations.get(i), distances.get(i)))
                .toList();

        return new PageImpl<>(responseList, pageable, res.getTotalElements());
    }

    private Page<Restaurants> getRestaurantsAfterValidation(
            Coordinates location, ResQuery resQuery, Pageable pageable) {
        if (location == null) {
            throw new InvalidRequestException("longitude and latitude is mandatory");
        }

        String category = resQuery.getCategory();
        String categoryName = (category != null && !category.isBlank()) ? category : null;

        String search = (resQuery.getSearch() != null && !resQuery.getSearch().isBlank()) ? resQuery.getSearch() : null;

        Sort sort = "desc".equalsIgnoreCase(resQuery.getRating())
                ? Sort.by(Sort.Order.desc("rating"), Sort.Order.asc("id"))
                : Sort.by("id").ascending();

        Pageable newPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        int nearby = (resQuery.getNearby() == null || resQuery.getNearby() > 20000) ? 20000 : resQuery.getNearby();

        return resRepository.findRestaurantsWithinDistance(
                location.getLongitude(), location.getLatitude(), nearby, search, resQuery.getEnabled(), newPageable);
    }

    @Override
    public ResResponse getRestaurantById(UUID id, Coordinates location) {
        Restaurants res = getByIdWithFetching(id);

        if (location == null) {
            return resMapper.toResResponse(res);
        }

        List<Double> start = List.of(location.getLongitude(), location.getLatitude());
        List<Double> end = List.of(res.getLongitude(), res.getLatitude());

        OrsDirectionResponse response = distanceService.getDistanceAndDuration(start, end);

        if (response == null || response.getFeatures().isEmpty()) {
            throw new DistanceDurationException("Error while calculating distance and duration");
        }

        Summary summary = response.getFeatures().get(0).getProperties().getSummary();
        return resMapper.toResResponse(res, summary.getDistance(), summary.getDuration());
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
        UserResponse user = webClientBuilder
                .build()
                .get()
                .uri("lb://user-service/api/users/admin/{id}", resRequest.getMerchantId())
                .retrieve()
                .bodyToMono(UserResponse.class)
                .block();

        validateMerchant(user, authUser);
        Restaurants res = buildRestaurant(resRequest);

        return saveRestaurant(res, imageFile);
    }

    @Transactional
    @Override
    public ResResponse updateRestaurant(UUID id, UpdateRes updateRes, MultipartFile imageFile, UserRole authUser) {
        Restaurants res = getByIdWithFetching(id);

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
        resRepository.save(res);
        return resMapper.toResResponse(res);
    }

    @Override
    @Transactional
    public void deleteRestaurant(UUID id, UserRole authUser) {
        Restaurants res = getById(id);
        checkAuthority(res.getMerchantId(), authUser);

        if (res.getPublicID() != null && !res.getPublicID().isEmpty()) {
            imageServiceClient.deleteImage(res.getPublicID());
        }
        resRepository.delete(res);
    }

    @Override
    @Transactional
    public void changeResStatus(UUID id) {
        Restaurants res = getById(id);
        res.setEnabled(!res.isEnabled());
        resRepository.save(res);
    }

    @Override
    @Transactional
    public void deleteImage(UUID resId, UserRole authUser) {
        Restaurants res = getById(resId);

        checkAuthority(res.getMerchantId(), authUser);
        imageServiceClient.deleteImage(res.getPublicID());
        res.setImageURL(null);
        res.setPublicID(null);
        resRepository.save(res);
    }

    @Override
    public ResResponse getRestaurantsByMerchantId(UUID id) {
        UserResponse user = webClientBuilder
                .build()
                .get()
                .uri("lb://user-service/api/users/admin/{id}", id)
                .retrieve()
                .bodyToMono(UserResponse.class)
                .block();

        if (user == null) {
            throw new ResourceNotFoundException("Không tồn tại user");
        }
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

    private Restaurants getByIdWithFetching(UUID id) {
        Restaurants res = resRepository
                .findWithCategoriesAndProductsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        return res;
    }

    private void checkAuthority(UUID id, UserRole authUser) {
        if (authUser != null && !authUser.getId().equals(id) && !"ADMIN".equals(authUser.getRole())) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }

    private void validateMerchant(UserResponse user, UserRole authUser) {
        if (user == null) throw new ResourceNotFoundException("Không tồn tại user");
        if ((!user.getId().equals(authUser.getId()) && !authUser.getRole().equals("MERCHANT"))
                && !authUser.getRole().equals("ADMIN")) {
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
