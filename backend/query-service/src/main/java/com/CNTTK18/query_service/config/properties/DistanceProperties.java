package com.CNTTK18.query_service.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@Data
@ConfigurationProperties(prefix = "openrouteservice")
public class DistanceProperties {
    private String apiKey;
    private String listUrl;
    private String url;
}
