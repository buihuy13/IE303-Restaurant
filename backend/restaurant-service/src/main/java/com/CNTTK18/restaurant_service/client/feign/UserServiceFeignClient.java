package com.CNTTK18.restaurant_service.client.feign;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.CNTTK18.restaurant_service.client.feign.dto.UserResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "user-service")
public interface UserServiceFeignClient {
    @GetMapping("/api/users/admin/{id}")
    @CircuitBreaker(name = "userService")
    @Retry(name = "userService")
    UserResponse getAdminUser(@PathVariable("id") UUID id);
}
