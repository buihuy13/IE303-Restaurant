package com.CNTTK18.restaurant_service.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
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
import com.CNTTK18.restaurant_service.data.ReviewType;
import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.api.UserResponse;
import com.CNTTK18.restaurant_service.dto.distance.response.Summary;
import com.CNTTK18.restaurant_service.dto.restaurant.request.Coordinates;
import com.CNTTK18.restaurant_service.dto.restaurant.request.ResRequest;
import com.CNTTK18.restaurant_service.dto.restaurant.request.UpdateRes;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponseWithProduct;
import com.CNTTK18.restaurant_service.exception.DistanceDurationException;
import com.CNTTK18.restaurant_service.exception.ForbiddenException;
import com.CNTTK18.restaurant_service.exception.InvalidRequestException;
import com.CNTTK18.restaurant_service.mapper.ResMapper;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.model.Reviews;
import com.CNTTK18.restaurant_service.repository.ResRepository;
import com.CNTTK18.restaurant_service.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@RequiredArgsConstructor
public class ResService {
    private final ResRepository resRepository;
    private final WebClient.Builder webClientBuilder;
    private final ImageHandleService imageService;
    private final ReviewRepository reviewRepository;
    private final DistanceService distanceService;
    private final ResMapper resMapper;

    public Mono<Page<ResResponseWithProduct>> getAllRestaurants(
            Coordinates location, String search, Integer nearby, String rating, String category, Pageable pageable) {

        return Mono.fromCallable(
                        () -> getRestaurantsAfterValidation(location, search, nearby, rating, category, pageable))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(res -> {
                    if (res.isEmpty()) return Mono.just(Page.empty(pageable));

                    List<Double> startingPoints = List.of(location.getLongitude(), location.getLatitude());
                    List<List<Double>> endPoints = res.stream()
                            .map(r -> List.of(r.getLongitude(), r.getLatitude()))
                            .toList();

                    return distanceService
                            .getDistanceAndDurationInList(startingPoints, endPoints)
                            .map(response -> {
                                List<Double> durations = response.getDurations().get(0);
                                List<Double> distances = response.getDistances().get(0);

                                List<ResResponseWithProduct> responseList = IntStream.range(
                                                0, res.getContent().size())
                                        .mapToObj(i -> {
                                            return resMapper.toResResponseWithProductAndDistanceAndDuration(
                                                    res.getContent().get(i), durations.get(i), distances.get(i));
                                        })
                                        .toList();

                                return new PageImpl<>(responseList, pageable, res.getTotalElements());
                            });
                });
    }

    private Page<Restaurants> getRestaurantsAfterValidation(
            Coordinates location, String search, Integer nearby, String rating, String category, Pageable pageable) {
        if (location == null) {
            throw new InvalidRequestException("longitude and latitude is mandatory");
        }
        List<String> categoryNames = (category == null || category.isBlank())
                ? List.of()
                : Arrays.stream(category.split(",")).map(String::toLowerCase).toList();

        search = (search != null && !search.isBlank()) ? search : null;

        Sort sort = null;
        if (rating != null && "desc".equalsIgnoreCase(rating)) {
            sort = Sort.by(Sort.Order.desc("rating"), Sort.Order.asc("id"));
        } else {
            sort = Sort.by("id").ascending();
        }

        Pageable newPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        nearby = (nearby == null || nearby > 20000) ? 20000 : nearby;
        Page<Restaurants> res = resRepository.findRestaurantsWithinDistance(
                location.getLongitude(), location.getLatitude(), nearby, search, categoryNames, newPageable);
        return res;
    }

    public Mono<ResResponseWithProduct> getRestaurantById(UUID id, Coordinates location) {
        return Mono.fromCallable(() -> getById(id))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(res -> {
                    if (location == null) {
                        return Mono.just(resMapper.toResResponseWithProduct(res));
                    }

                    List<Double> start = List.of(location.getLongitude(), location.getLatitude());
                    List<Double> end = List.of(res.getLongitude(), res.getLatitude());

                    return distanceService.getDistanceAndDuration(start, end).map(response -> {
                        if (response == null || response.getFeatures().isEmpty()) {
                            throw new DistanceDurationException("Error while calculating distance and duration");
                        }
                        Summary summary =
                                response.getFeatures().get(0).getProperties().getSummary();
                        return resMapper.toResResponseWithProductAndDistanceAndDuration(
                                res, summary.getDistance(), summary.getDuration());
                    });
                });
    }

    public ResResponseWithProduct getRestaurantBySlug(String slug) {
        Restaurants res =
                resRepository.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        return resMapper.toResResponseWithProduct(res);
    }

    @Transactional
    public Mono<Restaurants> createRestaurant(ResRequest resRequest, MultipartFile imageFile, UserRole authUser) {
        return webClientBuilder
                .build()
                .get()
                .uri("lb://user-service/api/users/admin/{id}", resRequest.getMerchantId())
                .retrieve()
                .bodyToMono(UserResponse.class)
                .flatMap(user -> {
                    validateMerchant(user, authUser);
                    Restaurants res = buildRestaurant(resRequest);

                    return Mono.fromCallable(() -> saveRestaurant(res, imageFile))
                            .subscribeOn(Schedulers.boundedElastic());
                });
    }

    @Transactional
    public ResResponseWithProduct updateRestaurant(
            UUID id, UpdateRes updateRes, MultipartFile imageFile, UserRole authUser) {
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
            Map<String, String> image = imageService.saveImageFile(imageFile);
            res.setImageURL(image.get("url"));
            res.setPublicID(image.get("public_id"));
            if (oldPublicId != null && !oldPublicId.isEmpty()) {
                imageService.deleteImage(oldPublicId);
            }
        }
        resRepository.save(res);
        return resMapper.toResResponseWithProduct(res);
    }

    @Transactional
    public void deleteRestaurant(UUID id, UserRole authUser) {
        Restaurants res = getById(id);
        checkAuthority(res.getMerchantId(), authUser);
        List<Reviews> rv = reviewRepository.findByReviewIdAndReviewType(id, ReviewType.RESTAURANT.toString());

        if (res.getPublicID() != null && !res.getPublicID().isEmpty()) {
            imageService.deleteImage(res.getPublicID());
        }
        reviewRepository.deleteAll(rv);
        resRepository.delete(res);
    }

    @Transactional
    public void changeResStatus(UUID id) {
        Restaurants res = getById(id);
        res.setEnabled(!res.isEnabled());
        resRepository.save(res);
    }

    @Transactional
    public void deleteImage(UUID resId, UserRole authUser) {
        Restaurants res = getById(resId);

        checkAuthority(res.getMerchantId(), authUser);
        imageService.deleteImage(res.getPublicID());
        res.setImageURL(null);
        res.setPublicID(null);
        resRepository.save(res);
    }

    public List<ResResponseWithProduct> getRestaurantsByMerchantId(UUID id) {
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
        if (!user.getRole().equals("MERCHANT")) {
            throw new InvalidRequestException("User không phải là merchant");
        }
        return resRepository
                .findRestaurantsByMerchantId(id)
                .map(list ->
                        list.stream().map(resMapper::toResResponseWithProduct).toList())
                .orElse(List.of());
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
        if ((!user.getId().equals(authUser.getId()) && !authUser.getRole().equals("MERCHANT")) && !authUser.getRole().equals("ADMIN")) {
            throw new InvalidRequestException("User không phải là merchant hay admin");
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
            Map<String, String> image = imageService.saveImageFile(imageFile);
            res.setImageURL(image.get("url"));
            res.setPublicID(image.get("public_id"));
        }
        return resRepository.save(res);
    }
}
