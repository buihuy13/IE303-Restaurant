package com.CNTTK18.restaurant_service.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
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
import com.CNTTK18.Common.Util.RandomIdGenerator;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.restaurant_service.data.ReviewType;
import com.CNTTK18.restaurant_service.dto.api.UserResponse;
import com.CNTTK18.restaurant_service.dto.distance.response.Summary;
import com.CNTTK18.restaurant_service.dto.restaurant.request.Coordinates;
import com.CNTTK18.restaurant_service.dto.restaurant.request.ResRequest;
import com.CNTTK18.restaurant_service.dto.restaurant.request.UpdateRes;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponseWithProduct;
import com.CNTTK18.restaurant_service.exception.DistanceDurationException;
import com.CNTTK18.restaurant_service.exception.ForbiddenException;
import com.CNTTK18.restaurant_service.exception.InvalidRequestException;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.model.Reviews;
import com.CNTTK18.restaurant_service.repository.ResRepository;
import com.CNTTK18.restaurant_service.repository.ReviewRepository;
import com.CNTTK18.restaurant_service.util.ResUtil;

import reactor.core.publisher.Mono;

@Service
public class ResService {
    private ResRepository resRepository;
    private WebClient.Builder webClientBuilder;
    private ImageHandleService imageService;
    private ReviewRepository reviewRepository;
    private DistanceService distanceService;

    public ResService(
            ResRepository resRepository,
            WebClient.Builder webClientBuilder,
            ImageHandleService imageHandleService,
            ReviewRepository reviewRepository,
            DistanceService distanceService) {
        this.resRepository = resRepository;
        this.webClientBuilder = webClientBuilder;
        this.imageService = imageHandleService;
        this.reviewRepository = reviewRepository;
        this.distanceService = distanceService;
    }

    public Mono<Page<ResResponseWithProduct>> getAllRestaurants(
            Coordinates location, String search, Integer nearby, String rating, String category, Pageable pageable) {

        Page<Restaurants> resPage = getRestaurantsAfterValidation(location, search, nearby, rating, category, pageable);
        if (resPage.isEmpty()) {
            return Mono.just(Page.empty(pageable));
        }

        List<String> resIds =
                resPage.getContent().stream().map(Restaurants::getId).toList();
        List<Restaurants> resDetails = resRepository.findWithDetailsByIdIn(resIds);
        Map<String, Restaurants> resById =
                resDetails.stream().collect(Collectors.toMap(Restaurants::getId, Function.identity()));
        List<Restaurants> res =
                resIds.stream().map(resById::get).filter(Objects::nonNull).toList();

        List<Double> startingPoints = List.of(location.getLongitude(), location.getLatitude());
        List<List<Double>> endPoints = res.stream()
                .map(r -> List.of(r.getLongitude(), r.getLatitude()))
                .toList();

        return distanceService
                .getDistanceAndDurationInList(startingPoints, endPoints)
                .map(response -> {
                    List<Double> durations = response.getDurations().get(0);
                    List<Double> distances = response.getDistances().get(0);

                    List<ResResponseWithProduct> responseList = IntStream.range(0, res.size())
                            .mapToObj(i -> ResUtil.mapResToResResponseWithProductListAndDistanceAndDuration(
                                    res.get(i), durations.get(i), distances.get(i)))
                            .toList();

                    return new PageImpl<>(responseList, pageable, resPage.getTotalElements());
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

    public Mono<ResResponseWithProduct> getRestaurantById(String id, Coordinates location) {
        Restaurants res = resRepository
                .findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (location != null) {
            List<Double> start = List.of(location.getLongitude(), location.getLatitude());
            List<Double> end = List.of(res.getLongitude(), res.getLatitude());
            return distanceService.getDistanceAndDuration(start, end).map(response -> {
                if (response == null || response.getFeatures().isEmpty()) {
                    throw new DistanceDurationException("Error while calculating distance and duration");
                }
                Summary summary = response.getFeatures().get(0).getProperties().getSummary();
                double distance = summary.getDistance();
                double duration = summary.getDuration();

                return ResUtil.mapResToResResponseWithProductandDistanceAndDuration(res, distance, duration);
            });
        }
        return Mono.just(ResUtil.mapResToResResponseWithProduct(res));
    }

    public ResResponseWithProduct getRestaurantBySlug(String slug) {
        Restaurants res = resRepository
                .findWithDetailsBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        return ResUtil.mapResToResResponseWithProduct(res);
    }

    @Transactional
    public Mono<Restaurants> createRestaurant(ResRequest resRequest, MultipartFile imageFile) {
        return webClientBuilder
                .build()
                .get()
                .uri("lb://user-service/api/users/admin/{id}", resRequest.getMerchantId())
                .retrieve()
                .bodyToMono(UserResponse.class)
                .flatMap(user -> {
                    if (user == null) {
                        throw new ResourceNotFoundException("Không tồn tại user");
                    }
                    if (!user.getRole().equals("MERCHANT")) {
                        throw new InvalidRequestException("User không phải là merchant");
                    }
                    Restaurants res = Restaurants.builder()
                            .address(resRequest.getAddress())
                            .categories(new HashSet<>())
                            .closingTime(resRequest.getClosingTime())
                            .enabled(false)
                            .id(RandomIdGenerator.generate(254))
                            .merchantId(resRequest.getMerchantId())
                            .openingTime(resRequest.getOpeningTime())
                            .phone(resRequest.getPhone())
                            .resName(resRequest.getResName())
                            .products(new HashSet<>())
                            .totalReview(0)
                            .rating(0f)
                            .longitude(resRequest.getLongitude())
                            .latitude(resRequest.getLatitude())
                            .slug(SlugGenerator.generate(resRequest.getResName()))
                            .build();

                    if (imageFile != null && !imageFile.isEmpty()) {
                        Map<String, String> image = imageService.saveImageFile(imageFile);
                        res.setImageURL(image.get("url"));
                        res.setPublicID(image.get("public_id"));
                    }
                    return Mono.fromCallable(() -> resRepository.save(res));
                });
    }

    @Transactional
    public ResResponseWithProduct updateRestaurant(
            String id, UpdateRes updateRes, MultipartFile imageFile, String userId) {
        Restaurants res =
                resRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (userId == null || !userId.equals(res.getMerchantId())) {
            throw new ForbiddenException("You do not have permission to update this restaurant.");
        }
        res.setAddress(updateRes.getAddress());
        res.setOpeningTime(updateRes.getOpeningTime());
        res.setClosingTime(updateRes.getClosingTime());
        res.setPhone(updateRes.getPhone());
        res.setLongitude(updateRes.getLongitude());
        res.setLatitude(updateRes.getLatitude());
        if (!res.getResName().equals(updateRes.getResName())) {
            res.setResName(updateRes.getResName());
            res.setSlug(updateRes.getResName());
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
        return ResUtil.mapResToResResponseWithProduct(res);
    }

    @Transactional
    public void deleteRestaurant(String id, String userId) {
        Restaurants res =
                resRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (userId == null || !userId.equals(res.getMerchantId())) {
            throw new ForbiddenException("You do not have permission to delete this restaurant.");
        }

        List<Reviews> rv = reviewRepository.findByReviewId(id).stream()
                .filter(r -> r.getReviewType().equals(ReviewType.RESTAURANT.toString()))
                .toList();

        if (res.getPublicID() != null && !res.getPublicID().isEmpty()) {
            imageService.deleteImage(res.getPublicID());
        }
        reviewRepository.deleteAll(rv);
        resRepository.delete(res);
    }

    @Transactional
    public void changeResStatus(String id) {
        Restaurants res =
                resRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        res.setEnabled(!res.isEnabled());
        resRepository.save(res);
    }

    public void deleteImage(String resId, String userId) {
        Restaurants res =
                resRepository.findById(resId).orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (userId == null || !userId.equals(res.getMerchantId())) {
            throw new ForbiddenException("You do not have permission to update this restaurant.");
        }
        imageService.deleteImage(res.getPublicID());
        res.setImageURL(null);
        res.setPublicID(null);
    }

    public List<ResResponseWithProduct> getRestaurantsByMerchantId(String id) {
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
        List<Restaurants> resList = resRepository.findWithDetailsByMerchantId(id);
        if (resList.isEmpty()) {
            return new ArrayList<>();
        }
        return resList.stream().map(ResUtil::mapResToResResponseWithProduct).toList();
    }
}
