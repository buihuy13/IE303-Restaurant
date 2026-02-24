package com.CNTTK18.user_service.service;

import org.keycloak.admin.client.Keycloak;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KeycloakEmailService {
    private final Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    @Async
    public void sendVerificationEmailWithKeycloak(String userId) {
        keycloak.realm(realm).users().get(userId).sendVerifyEmail();
    }
}
