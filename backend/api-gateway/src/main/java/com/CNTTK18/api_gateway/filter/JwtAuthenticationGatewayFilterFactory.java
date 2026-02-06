package com.CNTTK18.api_gateway.filter;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.CNTTK18.api_gateway.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationGatewayFilterFactory
        extends AbstractGatewayFilterFactory<JwtAuthenticationGatewayFilterFactory.Config> {

    private final JwtUtil jwtUtil;
    private final ObjectMapper mapper = new ObjectMapper();

    public JwtAuthenticationGatewayFilterFactory(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    public static class Config {
        private String requiredRole;

        public String getRequiredRole() {
            return requiredRole;
        }

        public void setRequiredRole(String role) {
            this.requiredRole = role;
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, int statusCode, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatusCode.valueOf(statusCode));
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> errorResponse = Map.of(
                "timestamp",
                new Date(),
                "status",
                statusCode,
                "error",
                HttpStatus.valueOf(statusCode).getReasonPhrase(),
                "message",
                message,
                "path",
                exchange.getRequest().getURI().getPath());
        try {
            byte[] bytes = mapper.writeValueAsBytes(errorResponse);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (Exception e) {
            return response.setComplete();
        }
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            var request = exchange.getRequest();

            // Kiểm tra header hoặc query có chứa token không
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null) {
                return onError(exchange, 401, "Header không chứa token");
            }

            authHeader = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

            try {
                // Xác thực token
                if (!jwtUtil.validateToken(authHeader)) {
                    return onError(exchange, 401, "Token lỗi");
                }
                String requiredRole = config.getRequiredRole();
                // Nếu route này có yêu cầu role
                if (requiredRole != null && !requiredRole.isEmpty()) {
                    String userRoles = jwtUtil.extractRole(authHeader);
                    List<String> roles = Arrays.asList(requiredRole.split(","));

                    // Kiểm tra xem người dùng có quyền yêu cầu không
                    if (userRoles == null || !roles.stream().anyMatch(r -> r.equals(userRoles))) {
                        return onError(exchange, 403, "Không có quyền");
                    }
                }

                // Thêm header user-id vào request
                ServerHttpRequest mutatedRequest = exchange.getRequest()
                        .mutate()
                        .header("user-id", jwtUtil.extractUserId(authHeader))
                        .build();

                exchange = exchange.mutate().request(mutatedRequest).build();
                return chain.filter(exchange);
            } catch (Exception e) {
                return onError(exchange, 401, e.getMessage());
            }
        });
    }
}
