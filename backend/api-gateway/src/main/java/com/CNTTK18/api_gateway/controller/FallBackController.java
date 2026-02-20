package com.CNTTK18.api_gateway.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import reactor.core.publisher.Mono;

@RestController
public class FallBackController {

    @RequestMapping("/fallback")
    public Mono<ResponseEntity<Map<String, Object>>> fallback(ServerWebExchange exchange) {
        
        // Lấy exception gây lỗi
        Throwable exception = exchange.getAttribute(ServerWebExchangeUtils.CIRCUITBREAKER_EXECUTION_EXCEPTION_ATTR);
        
        Route route = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR);
        String routeId = (route != null) ? route.getId() : "unknown service";

        // xử lý thông báo lỗi
        String message = "Service unavailable";
        HttpStatus status = HttpStatus.SERVICE_UNAVAILABLE;

        if (exception instanceof TimeoutException) {
            message = routeId + " phản hồi quá lâu (Timeout).";
            status = HttpStatus.GATEWAY_TIMEOUT; // 504
        } else if (exception instanceof CallNotPermittedException) {
            message = routeId + " đang bị ngắt mạch (Circuit Open).";
        } else {
            message = "Lỗi không xác định từ " + routeId;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", message);
        response.put("failed_service", routeId);
        response.put("timestamp", System.currentTimeMillis());

        return Mono.just(ResponseEntity.status(status).body(response));
    }
}
