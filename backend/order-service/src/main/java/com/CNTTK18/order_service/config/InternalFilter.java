package com.CNTTK18.order_service.config;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.CNTTK18.order_service.dto.UserRole;

@Component
public class InternalFilter extends OncePerRequestFilter {
    private static final Set<String> ALLOWED_ROLES = Set.of("USER", "MERCHANT", "ADMIN");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String id = request.getHeader("user-id");
        String role = request.getHeader("role");

        if (id != null && !id.isBlank()) {
            if (role == null || role.isBlank()) {
                writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Missing role header");
                return;
            }

            final UUID userId;
            try {
                userId = UUID.fromString(id);
            } catch (IllegalArgumentException ex) {
                writeJsonError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid user-id header format");
                return;
            }

            String normalizedRole = role.trim().toUpperCase(Locale.ROOT);
            if (!ALLOWED_ROLES.contains(normalizedRole)) {
                writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid role header");
                return;
            }

            UserRole userRole = new UserRole(userId, normalizedRole);
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(userRole, null, null);
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        filterChain.doFilter(request, response);
    }

    private void writeJsonError(HttpServletResponse response, int statusCode, String message) throws IOException {
        response.setStatus(statusCode);
        response.setCharacterEncoding("UTF-8");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
