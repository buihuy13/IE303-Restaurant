package com.CNTTK18.auth_service.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@Data
@ConfigurationProperties(prefix = "spring.security.oauth2.client.registration.facebook")
public class FacebookProperties {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String scope;
}
