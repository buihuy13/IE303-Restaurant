package com.CNTTK18.restaurant_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;

@SpringBootApplication(scanBasePackages = "com.CNTTK18.restaurant_service, com.CNTTK18.Common")
@OpenAPIDefinition(servers = @Server(url = "${gateway.url}"))
public class RestaurantServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RestaurantServiceApplication.class, args);
    }
}
