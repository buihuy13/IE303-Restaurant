package com.CNTTK18.image_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI imageServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Image Service API")
                        .description("Centralized Image Management Service")
                        .version("1.0")
                        .license(new License().name("Apache 2.0")));
    }
}
