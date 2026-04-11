package com.CNTTK18.dashboard_service.security;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.exception.ForbiddenException;

@Service
public class CurrentUserService {

    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ForbiddenException("Access denied");
        }

        try {
            return UUID.fromString(jwt.getSubject());
        } catch (Exception ex) {
            throw new ForbiddenException("Access denied");
        }
    }

    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        String expected = "ROLE_" + Optional.ofNullable(role).orElse("").toUpperCase();
        return authentication.getAuthorities().stream().anyMatch(auth -> expected.equals(auth.getAuthority()));
    }
}
