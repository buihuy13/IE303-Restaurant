package com.CNTTK18.recommendation_service.config;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.CNTTK18.recommendation_service.dto.UserRole;

@Component
public class InternalFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String id = request.getHeader("user-id");
            String role = request.getHeader("role");

            if (id != null && !id.isBlank()) {
                UUID userId = UUID.fromString(id);
                UserRole userRole = new UserRole(userId, role);
                List<SimpleGrantedAuthority> authorities =
                        role != null ? List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())) : List.of();
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userRole, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            throw e;
        }
    }
}
