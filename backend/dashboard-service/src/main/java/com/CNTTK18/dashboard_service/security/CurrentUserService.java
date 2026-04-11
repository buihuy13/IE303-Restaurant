package com.CNTTK18.dashboard_service.security;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.exception.ForbiddenException;

@Service
public class CurrentUserService {

    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ForbiddenException("Access denied");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UUID userId) {
            return userId;
        }

        if (principal instanceof String userId && !userId.isBlank()) {
            try {
                return UUID.fromString(userId);
            } catch (Exception ex) {
                throw new ForbiddenException("Access denied");
            }
        }

        throw new ForbiddenException("Access denied");
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
