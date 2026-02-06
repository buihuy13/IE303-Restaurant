package com.CNTTK18.auth_service.service;

import java.util.UUID;

import com.CNTTK18.auth_service.model.data.Role;

public interface JwtService {
    String generateToken(String username, Role role, UUID id);

    String extractUserName(String token) throws Exception;

    boolean validateToken(String token);

    String generateRefreshToken(String username, Role role, UUID id);

    String refreshAccessToken(String refreshToken) throws Exception;

    String generateOneTimeToken(Role role, UUID id);
}
