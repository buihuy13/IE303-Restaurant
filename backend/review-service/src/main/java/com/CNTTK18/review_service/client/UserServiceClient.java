package com.CNTTK18.review_service.client;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/api/users/admin/{id}")
    @CircuitBreaker(name = "userService")
    @Retry(name = "userService")
    void getUserById(@PathVariable("id") UUID id);
}
