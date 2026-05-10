package com.CNTTK18.review_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;

@SpringBootApplication(scanBasePackages = "com.CNTTK18.review_service, com.CNTTK18.Common")
@EnableFeignClients
@OpenAPIDefinition(servers = @Server(url = "${gateway.url}"))
@EnableJpaAuditing
public class ReviewServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReviewServiceApplication.class, args);
    }
}
