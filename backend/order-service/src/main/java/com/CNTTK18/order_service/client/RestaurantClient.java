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
        return webClientBuilder.build()
                .get()
                .uri("http://restaurant-service/api/productsize/{id}", productSizeId)
                .retrieve()
                .bodyToMono(ProductSizeClientResponse.class);
    }

    public Mono<ProductClientResponse> getProduct(UUID productId) {
        return webClientBuilder.build()
                .get()
                .uri("http://restaurant-service/api/products/admin/{id}", productId)
                .retrieve()
                .bodyToMono(ProductClientResponse.class);
    }

    public Mono<ResClientResponse> getRestaurant(UUID restaurantId) {
        return webClientBuilder.build()
                .get()
                .uri("http://restaurant-service/api/restaurants/{id}", restaurantId)
                .retrieve()
                .bodyToMono(ResClientResponse.class);
    }
}
