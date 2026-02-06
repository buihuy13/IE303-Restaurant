package com.CNTTK18.auth_service.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.auth_service.model.Users;
import com.CNTTK18.auth_service.model.data.AuthProvider;
import com.CNTTK18.auth_service.model.data.Role;
import com.CNTTK18.auth_service.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOauth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String authProvider = userRequest.getClientRegistration().getRegistrationId();

        // Lấy các thuộc tính của người dùng từ Google
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Optional<Users> userFound = userRepository.findByUsername(name);
        if (userFound.isEmpty()) {
            Users user = Users.builder()
                    .id(UUID.randomUUID())
                    .email(email)
                    .username(name)
                    .role(Role.USER)
                    .enabled(true)
                    .authProvider(getAuthProvider(authProvider))
                    .build();
            userRepository.save(user);
        } else {
            Users user = userFound.get();
            if (!user.getAuthProvider().equals(getAuthProvider(authProvider))) {
                throw new OAuth2AuthenticationException(
                        "Please use your " + user.getAuthProvider() + " account to login.");
            }
        }
        return oAuth2User;
    }

    private AuthProvider getAuthProvider(String provider) {
        return switch (provider.toLowerCase()) {
            case "google" -> AuthProvider.GOOGLE;
            case "facebook" -> AuthProvider.FACEBOOK;
            default -> throw new OAuth2AuthenticationException("Unsupported auth provider: " + provider);
        };
    }
}
