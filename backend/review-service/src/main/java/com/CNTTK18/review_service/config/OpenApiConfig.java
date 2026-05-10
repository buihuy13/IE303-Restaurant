package com.CNTTK18.review_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI reviewServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Review Service API")
                        .description("Review Service API for Products and Restaurants")
                        .version("1.0")
                        .license(new License().name("Apache 2.0")));
    }
}
