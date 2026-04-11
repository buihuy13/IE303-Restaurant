package com.CNTTK18.api_gateway.filter;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import reactor.core.publisher.Mono;

@Component
public class HeaderForwardFilter implements WebFilter {

    @Override
    @NonNull
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .flatMap(ctx -> {
                    var authentication = ctx.getAuthentication();
                    if (authentication == null) {
                        return chain.filter(exchange);
                    }

                    Object principal = authentication.getPrincipal();
                    if (!(principal instanceof Jwt jwt)) {
                        return chain.filter(exchange);
                    }

                    String userId = jwt.getSubject();
                    if (userId == null || userId.isBlank()) {
                        return chain.filter(exchange);
                    }

                    String role = extractRole(authentication.getAuthorities());

                    ServerHttpRequest mutated = exchange.getRequest()
                            .mutate()
                            .headers(headers -> {
                                headers.set("user-id", userId);
                                if (role != null && !role.isBlank()) {
                                    headers.set("role", role);
                                }
                            })
                            .build();

                    return chain.filter(exchange.mutate().request(mutated).build());
                })
                .onErrorResume(ex -> chain.filter(exchange))
                .switchIfEmpty(chain.filter(exchange));
    }

    private String extractRole(Collection<? extends GrantedAuthority> authorities) {
        if (authorities == null || authorities.isEmpty()) {
            return null;
        }

        Set<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority != null && authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (roles.isEmpty()) {
            return null;
        }

        if (roles.contains("ADMIN")) {
            return "ADMIN";
        }
        if (roles.contains("MERCHANT")) {
            return "MERCHANT";
        }
        if (roles.contains("USER")) {
            return "USER";
        }

        return roles.iterator().next();
    }
}
