package com.CNTTK18.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity.AuthorizeExchangeSpec;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;

import com.CNTTK18.api_gateway.converter.KeycloakRoleConverter;
import com.CNTTK18.api_gateway.filter.HeaderForwardFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final HeaderForwardFilter headerForwardFilter;

    private static final String[] PUBLIC_PATHS = {
        "/actuator/**",
        "/eureka/**",
        "/api-docs/**",
        "/v3/api-docs/**",
        "/ws",
        "/api/users/register",
        "/api/payments/webhook",
        "/api/sse/**"
    };

    @Bean
    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {
        return http
                // Bật CORS để Spring Security tôn trọng cấu hình globalcors trong
                // application.yml
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .authorizeExchange(exchanges -> configureAuthorization(exchanges))
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter())))
                .addFilterAfter(headerForwardFilter, SecurityWebFiltersOrder.AUTHORIZATION)
                .build();
    }

    private AuthorizeExchangeSpec configureAuthorization(AuthorizeExchangeSpec exchanges) {
        return exchanges
                // Cho phép preflight CORS (OPTIONS) cho mọi path để browser có thể gửi request
                // từ http://localhost:3000
                .pathMatchers(HttpMethod.OPTIONS, "/**")
                .permitAll()
                .pathMatchers(PUBLIC_PATHS)
                .permitAll()
                // user-service
                .pathMatchers(HttpMethod.POST, "/api/users/address")
                .hasRole("USER")
                .pathMatchers(HttpMethod.DELETE, "/api/users/address")
                .hasAnyRole("USER", "ADMIN")
                .pathMatchers(HttpMethod.GET, "/api/users/addresses/**")
                .hasAnyRole("USER", "ADMIN")
                // restaurant-service
                .pathMatchers(HttpMethod.POST, "/api/category/**")
                .hasRole("ADMIN")
                .pathMatchers(HttpMethod.PUT, "/api/category/**")
                .hasRole("ADMIN")
                .pathMatchers(HttpMethod.DELETE, "/api/category/**")
                .hasRole("ADMIN")
                .pathMatchers(HttpMethod.POST, "/api/products/*")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.PUT, "/api/products/*")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.DELETE, "/api/products/*")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.PUT, "/api/products/availability/*")
                .hasAnyRole("ADMIN")
                .pathMatchers(HttpMethod.DELETE, "/api/products/image/*")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.POST, "/api/productsize/**")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.PUT, "/api/productsize/**")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.DELETE, "/api/productsize/**")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.POST, "/api/size/**")
                .hasRole("ADMIN")
                .pathMatchers(HttpMethod.PUT, "/api/size/**")
                .hasRole("ADMIN")
                .pathMatchers(HttpMethod.DELETE, "/api/size/**")
                .hasRole("ADMIN")
                .pathMatchers(HttpMethod.POST, "/api/restaurant/*")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.PUT, "/api/restaurant/*")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.DELETE, "/api/restaurant/*")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.PUT, "/api/restaurant/enable/*")
                .hasAnyRole("ADMIN")
                .pathMatchers(HttpMethod.DELETE, "/api/restaurant/image/*")
                .hasAnyRole("ADMIN", "MERCHANT")
                // payment-service
                .pathMatchers("/api/payments/**")
                .hasRole("USER")
                // blog-service
                .pathMatchers(HttpMethod.GET, "/api/blogs/drafts", "/api/blogs/archived")
                .authenticated()
                .pathMatchers(HttpMethod.GET, "/api/blogs/comments")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.PATCH, "/api/blogs/comments/*/status")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.GET, "/api/blogs/**")
                .permitAll()
                .pathMatchers(HttpMethod.POST, "/api/blogs/editorial-templates/**")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.POST, "/api/blogs/*/views")
                .permitAll()
                .pathMatchers(HttpMethod.POST, "/api/blogs/*/comments")
                .authenticated()
                .pathMatchers(HttpMethod.POST, "/api/blogs/*/likes")
                .authenticated()
                .pathMatchers(HttpMethod.DELETE, "/api/blogs/*/likes")
                .authenticated()
                .pathMatchers(HttpMethod.POST, "/api/blogs/images/upload")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.POST, "/api/blogs")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.PUT, "/api/blogs/**")
                .hasAnyRole("ADMIN", "MERCHANT")
                .pathMatchers(HttpMethod.DELETE, "/api/blogs/**")
                .hasAnyRole("ADMIN", "MERCHANT")
                .anyExchange()
                .authenticated();
    }

    @Bean
    public ReactiveJwtAuthenticationConverterAdapter jwtAuthConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }
}
