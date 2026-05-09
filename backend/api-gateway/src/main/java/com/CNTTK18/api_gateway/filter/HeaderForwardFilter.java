package com.CNTTK18.api_gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.lang.NonNull;
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
                    Jwt jwt = (Jwt) authentication.getPrincipal();
                    var authorities = authentication.getAuthorities();
                    String userId = jwt.getSubject();
                    String username = jwt.getClaimAsString("preferred_username");
                    String email = jwt.getClaimAsString("email");
                    String role = authorities.stream()
                            .findFirst()
                            .get()
                            .getAuthority()
                            .toString()
                            .substring(5);

                    ServerHttpRequest mutated = exchange.getRequest()
                            .mutate()
                            .header("user-id", userId)
                            .header("role", role)
                            .headers(headers -> {
                                if (username != null && !username.isBlank()) {
                                    headers.set("username", username);
                                }
                                if (email != null && !email.isBlank()) {
                                    headers.set("email", email);
                                }
                            })
                            .build();

                    return chain.filter(exchange.mutate().request(mutated).build());
                })
                .switchIfEmpty(chain.filter(exchange));
    }
}
