package com.CNTTK18.auth_service.service;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.auth_service.model.Users;
import com.CNTTK18.auth_service.model.data.Role;
import com.CNTTK18.auth_service.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class Oauth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    @Value("${frontend.url}")
    private String frontendUrl;

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        // Lấy thông tin user đã được xác thực
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String username = oAuth2User.getAttribute("name");
        Users user =
                userRepository.findByUserName(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String accessToken = jwtService.generateToken(username, Role.USER, user.getId());
        String redirectUrl = frontendUrl + "?token=" + accessToken;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
