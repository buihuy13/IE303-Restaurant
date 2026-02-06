package com.CNTTK18.auth_service.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface CookiesService {
    void deleteRefreshTokenInCookie(HttpServletResponse response);

    String extractRefreshTokenFromCookie(HttpServletRequest request);

    void addRefreshTokenToCookie(String refreshToken, HttpServletResponse response);
}
