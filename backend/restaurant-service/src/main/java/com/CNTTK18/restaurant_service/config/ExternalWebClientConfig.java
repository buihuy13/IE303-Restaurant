package com.CNTTK18.restaurant_service.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class ExternalWebClientConfig {
    // Loại bỏ đi LoadBalanced để có thể route ra internet chứ không phải là tìm service trong service-discovery
    @Bean
    @Qualifier("externalWebClient")
    public WebClient webClient() {
        return WebClient.builder().build();
    }
}
