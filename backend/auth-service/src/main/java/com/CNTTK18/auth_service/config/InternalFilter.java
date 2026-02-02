package com.CNTTK18.auth_service.config;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.CNTTK18.auth_service.model.UserPrinciple;
import com.CNTTK18.auth_service.service.MyUserDetailsService;

@Component
@RequiredArgsConstructor
public class InternalFilter extends OncePerRequestFilter {
    private final ApplicationContext applicationContext;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String id = request.getHeader("user-id");

            if (id != null && !id.isBlank()) {
                UUID userId = UUID.fromString(id);
                UserPrinciple userDetails =
                        applicationContext.getBean(MyUserDetailsService.class).loadUserByUserId(userId);
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            throw e;
        }
    }
}
