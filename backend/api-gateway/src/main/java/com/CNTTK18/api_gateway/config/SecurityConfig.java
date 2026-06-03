package com.CNTTK18.api_gateway.config;

import java.util.List;

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
import com.CNTTK18.api_gateway.data.Roles;
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
        "/ws/**",
        "/api/users/register",
        "/api/payments/webhook",
        "/payment/payos-webhook",
        "/api/sse/**"
    };

    private static final List<RouteRule> ROUTE_RULES = List.of(
            // dashboard-service
            RouteRule.role("/api/dashboard/**", Roles.ADMIN.name()),
            RouteRule.anyRole("/api/merchant/dashboard/**", Roles.MERCHANT.name(), Roles.ADMIN.name()),
            // user-service
            RouteRule.role(HttpMethod.POST, "/api/users/address", Roles.USER.name()),
            RouteRule.anyRole(HttpMethod.DELETE, "/api/users/address", Roles.USER.name(), Roles.ADMIN.name()),
            RouteRule.anyRole(HttpMethod.GET, "/api/users/addresses/**", Roles.USER.name(), Roles.ADMIN.name()),
            // product-service
            RouteRule.permit(HttpMethod.GET, "/api/products/**"),
            RouteRule.anyRole(HttpMethod.POST, "/api/products/*", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.PUT, "/api/products/*", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.DELETE, "/api/products/*", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.role(HttpMethod.PUT, "/api/products/availability/*", Roles.ADMIN.name()),
            RouteRule.anyRole(HttpMethod.DELETE, "/api/products/image/*", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.permit(HttpMethod.GET, "/api/productsize/**"),
            RouteRule.anyRole(HttpMethod.POST, "/api/productsize/**", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.PUT, "/api/productsize/**", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.DELETE, "/api/productsize/**", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            // catalog-service
            RouteRule.permit(HttpMethod.GET, "/api/catalog/category/**"),
            RouteRule.role(HttpMethod.POST, "/api/catalog/category/**", Roles.ADMIN.name()),
            RouteRule.role(HttpMethod.PUT, "/api/catalog/category/**", Roles.ADMIN.name()),
            RouteRule.role(HttpMethod.DELETE, "/api/catalog/category/**", Roles.ADMIN.name()),
            RouteRule.permit(HttpMethod.GET, "/api/catalog/size/**"),
            RouteRule.role(HttpMethod.POST, "/api/catalog/size/**", Roles.ADMIN.name()),
            RouteRule.role(HttpMethod.PUT, "/api/catalog/size/**", Roles.ADMIN.name()),
            RouteRule.role(HttpMethod.DELETE, "/api/catalog/size/**", Roles.ADMIN.name()),
            // review-service
            RouteRule.permit(HttpMethod.GET, "/api/review/**"),
            RouteRule.authenticated(HttpMethod.POST, "/api/review"),
            RouteRule.authenticated(HttpMethod.DELETE, "/api/review/*"),
            // query-service
            RouteRule.permit(HttpMethod.GET, "/api/query/**"),
            // restaurant-service
            RouteRule.permit(HttpMethod.GET, "/api/restaurant/**"),
            RouteRule.anyRole(HttpMethod.POST, "/api/restaurant/*", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.PUT, "/api/restaurant/*", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.DELETE, "/api/restaurant/*", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.role(HttpMethod.PUT, "/api/restaurant/enable/*", Roles.ADMIN.name()),
            RouteRule.anyRole(HttpMethod.DELETE, "/api/restaurant/image/*", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            // payment-service
            RouteRule.role("/api/payments/**", Roles.USER.name()),
            RouteRule.role("/api/wallets/**", Roles.MERCHANT.name()),
            RouteRule.role("/api/admin/wallets/**", Roles.ADMIN.name()),
            // blog-service
            RouteRule.authenticated(HttpMethod.GET, "/api/blogs/drafts", "/api/blogs/archived"),
            RouteRule.anyRole(HttpMethod.GET, "/api/blogs/comments", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(
                    HttpMethod.PATCH, "/api/blogs/comments/*/status", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.permit(HttpMethod.GET, "/api/blogs/**"),
            RouteRule.anyRole(
                    HttpMethod.POST, "/api/blogs/editorial-templates/**", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.permit(HttpMethod.POST, "/api/blogs/*/views"),
            RouteRule.authenticated(HttpMethod.POST, "/api/blogs/*/comments"),
            RouteRule.authenticated(HttpMethod.POST, "/api/blogs/*/likes"),
            RouteRule.authenticated(HttpMethod.DELETE, "/api/blogs/*/likes"),
            RouteRule.anyRole(HttpMethod.POST, "/api/blogs/images/upload", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.POST, "/api/blogs", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.PUT, "/api/blogs/**", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.DELETE, "/api/blogs/**", Roles.ADMIN.name(), Roles.MERCHANT.name()),
            // order-service: cart (USER & MERCHANT có thể mua hàng)
            RouteRule.anyRole(HttpMethod.GET, "/api/cart", Roles.USER.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.POST, "/api/cart", Roles.USER.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.PUT, "/api/cart", Roles.USER.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.DELETE, "/api/cart", Roles.USER.name(), Roles.MERCHANT.name()),
            // order-service: đặt hàng & xem đơn của chính mình
            RouteRule.anyRole(HttpMethod.POST, "/api/order/checkout", Roles.USER.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.GET, "/api/order", Roles.USER.name(), Roles.MERCHANT.name()),
            RouteRule.anyRole(HttpMethod.PUT, "/api/order/*/cancel", Roles.USER.name(), Roles.MERCHANT.name()),
            // order-service: nhà hàng & admin quản lý đơn
            RouteRule.anyRole(HttpMethod.GET, "/api/order/restaurant/**", Roles.MERCHANT.name(), Roles.ADMIN.name()),
            RouteRule.anyRole(HttpMethod.PUT, "/api/order/*/status", Roles.MERCHANT.name(), Roles.ADMIN.name()),
            // order-service: xem chi tiết đơn (ownership check ở service layer)
            RouteRule.anyRole(
                    HttpMethod.GET, "/api/order/*", Roles.USER.name(), Roles.MERCHANT.name(), Roles.ADMIN.name()),
            // order-service: payment sync - chỉ nội bộ (admin)
            RouteRule.role(HttpMethod.PUT, "/api/order/*/payment", Roles.ADMIN.name()));

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
        exchanges.pathMatchers(HttpMethod.OPTIONS, "/**").permitAll();
        exchanges.pathMatchers(PUBLIC_PATHS).permitAll();

        ROUTE_RULES.forEach(rule -> rule.apply(exchanges));

        return exchanges.anyExchange().authenticated();
    }

    @Bean
    public ReactiveJwtAuthenticationConverterAdapter jwtAuthConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }

    private enum RuleType {
        PERMIT_ALL,
        AUTHENTICATED,
        HAS_ROLE,
        HAS_ANY_ROLE
    }

    private record RouteRule(HttpMethod method, String[] paths, RuleType ruleType, String[] roles) {
        static RouteRule permit(HttpMethod method, String... paths) {
            return new RouteRule(method, paths, RuleType.PERMIT_ALL, new String[0]);
        }

        static RouteRule authenticated(HttpMethod method, String... paths) {
            return new RouteRule(method, paths, RuleType.AUTHENTICATED, new String[0]);
        }

        static RouteRule role(String path, String role) {
            return role(null, path, role);
        }

        static RouteRule role(HttpMethod method, String path, String role) {
            return new RouteRule(method, new String[] {path}, RuleType.HAS_ROLE, new String[] {role});
        }

        static RouteRule anyRole(String path, String... roles) {
            return anyRole(null, path, roles);
        }

        static RouteRule anyRole(HttpMethod method, String path, String... roles) {
            return new RouteRule(method, new String[] {path}, RuleType.HAS_ANY_ROLE, roles);
        }

        void apply(AuthorizeExchangeSpec exchanges) {
            var matcher = method == null ? exchanges.pathMatchers(paths) : exchanges.pathMatchers(method, paths);
            switch (ruleType) {
                case PERMIT_ALL -> matcher.permitAll();
                case AUTHENTICATED -> matcher.authenticated();
                case HAS_ROLE -> matcher.hasRole(roles[0]);
                case HAS_ANY_ROLE -> matcher.hasAnyRole(roles);
            }
        }
    }
}
