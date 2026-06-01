package com.CNTTK18.order_service.client;

import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.order_service.dto.client.ProductClientResponse;
import com.CNTTK18.order_service.dto.client.ProductSizeClientResponse;
import com.CNTTK18.order_service.dto.client.ResClientResponse;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class RestaurantClient {
    private final WebClient.Builder webClientBuilder;

    public Mono<ProductSizeClientResponse> getProductSize(UUID productSizeId) {
        return webClientBuilder
                .build()
                .get()
                .uri("http://product-service/api/productsize/{id}", productSizeId)
                .retrieve()
                .bodyToMono(ProductSizeClientResponse.class);
    }

    public Mono<ProductClientResponse> getProduct(UUID productId) {
        return webClientBuilder
                .build()
                .get()
                .uri("http://product-service/api/products/{id}", productId)
                .retrieve()
                .bodyToMono(ProductClientResponse.class);
    }

    public Mono<ResClientResponse> getRestaurant(UUID restaurantId) {
        return webClientBuilder
                .build()
                .get()
                .uri("http://restaurant-service/api/restaurant/admin/{id}", restaurantId)
                .retrieve()
                .bodyToMono(ResClientResponse.class);
    }

    /**
     * Lấy restaurant chứa product này.
     * Dùng để validate product ownership trong AddToCart mà không cần restaurantId từ product response.
     */
    public Mono<ResClientResponse> getRestaurantByProductId(UUID productId) {
        return webClientBuilder
                .build()
                .get()
                .uri("http://product-service/api/products/res/{id}", productId)
                .retrieve()
                .bodyToMono(ResClientResponse.class);
    }

    public Mono<ResClientResponse> getRestaurantByMerchantId(UUID merchantId) {
        return webClientBuilder
                .build()
                .get()
                .uri("http://restaurant-service/api/restaurant/merchant/{id}", merchantId)
                .retrieve()
                .bodyToMono(ResClientResponse.class);
    }
}
