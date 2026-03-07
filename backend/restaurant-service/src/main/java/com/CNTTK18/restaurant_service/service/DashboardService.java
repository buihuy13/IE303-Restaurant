package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.restaurant_service.dto.api.UserResponse;
import com.CNTTK18.restaurant_service.dto.dashboard.response.MerchantOverviewResponse;
import com.CNTTK18.restaurant_service.dto.dashboard.response.RestaurantStatsResponse;
import com.CNTTK18.restaurant_service.exception.ForbiddenException;
import com.CNTTK18.restaurant_service.exception.InvalidRequestException;
import com.CNTTK18.restaurant_service.model.Restaurants;
import com.CNTTK18.restaurant_service.repository.ResRepository;

@Service
public class DashboardService {
    private ResRepository resRepository;
    private WebClient.Builder webClientBuilder;

    public DashboardService(ResRepository resRepository, WebClient.Builder webClientBuilder) {
        this.resRepository = resRepository;
        this.webClientBuilder = webClientBuilder;
    }

    public MerchantOverviewResponse getMerchantOverview(String merchantId, String requestUserId) {
        // Verify merchant exists and user has permission
        validateMerchantAccess(merchantId, requestUserId);

        // Get the merchant's restaurant (should be only one)
        List<Restaurants> restaurants = resRepository.findWithDetailsByMerchantId(merchantId);

        if (restaurants.isEmpty()) {
            throw new ResourceNotFoundException("No restaurant found for this merchant");
        }

        // Since each merchant has only one restaurant, get the first one
        Restaurants restaurant = restaurants.get(0);

        return MerchantOverviewResponse.builder()
                .restaurantId(restaurant.getId())
                .restaurantName(restaurant.getResName())
                .restaurantSlug(restaurant.getSlug())
                .restaurantEnabled(restaurant.isEnabled())
                .totalProducts(
                        restaurant.getProducts() != null
                                ? restaurant.getProducts().size()
                                : 0)
                .rating(restaurant.getRating())
                .totalReviews(restaurant.getTotalReview())
                .address(restaurant.getAddress())
                .imageURL(restaurant.getImageURL())
                .openingTime(
                        restaurant.getOpeningTime() != null
                                ? restaurant.getOpeningTime().toString()
                                : null)
                .closingTime(
                        restaurant.getClosingTime() != null
                                ? restaurant.getClosingTime().toString()
                                : null)
                .build();
    }

    public List<RestaurantStatsResponse> getRestaurantStats(String merchantId, String requestUserId) {
        // Verify merchant exists and user has permission
        validateMerchantAccess(merchantId, requestUserId);

        List<Restaurants> restaurants = resRepository.findWithDetailsByMerchantId(merchantId);

        if (restaurants.isEmpty()) {
            throw new ResourceNotFoundException("No restaurant found for this merchant");
        }

        return restaurants.stream().map(this::mapToRestaurantStats).collect(Collectors.toList());
    }

    private RestaurantStatsResponse mapToRestaurantStats(Restaurants restaurant) {
        return RestaurantStatsResponse.builder()
                .id(restaurant.getId())
                .resName(restaurant.getResName())
                .slug(restaurant.getSlug())
                .address(restaurant.getAddress())
                .imageURL(restaurant.getImageURL())
                .rating(restaurant.getRating())
                .totalReview(restaurant.getTotalReview())
                .productCount(
                        restaurant.getProducts() != null
                                ? restaurant.getProducts().size()
                                : 0)
                .enabled(restaurant.isEnabled())
                .openingTime(
                        restaurant.getOpeningTime() != null
                                ? restaurant.getOpeningTime().toString()
                                : null)
                .closingTime(
                        restaurant.getClosingTime() != null
                                ? restaurant.getClosingTime().toString()
                                : null)
                .build();
    }

    private void validateMerchantAccess(String merchantId, String requestUserId) {
        // Verify user exists and is a merchant
        UserResponse user = webClientBuilder
                .build()
                .get()
                .uri("lb://user-service/api/users/admin/{id}", merchantId)
                .retrieve()
                .bodyToMono(UserResponse.class)
                .block();

        if (user == null) {
            throw new ResourceNotFoundException("Merchant not found");
        }
        if (!"MERCHANT".equals(user.getRole())) {
            throw new InvalidRequestException("User is not a merchant");
        }

        // Verify requesting user has permission (must be the merchant themselves)
        if (requestUserId != null && !requestUserId.equals(merchantId)) {
            throw new ForbiddenException("You do not have permission to access this merchant's dashboard");
        }
    }
}
