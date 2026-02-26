package com.CNTTK18.chat_service.service.Impl;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.CNTTK18.chat_service.service.TokenService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class TokenServiceImpl implements TokenService {

    @Value("${jwt.secretkey}")
    private String secretkey;

    // Generate token
    public String generateToken(UUID id) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", id.toString());
        claims.put("tokenType", "one-time-token");
        return Jwts.builder()
                .claims()
                .add(claims)
                .subject("one-time-token")
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1 * 60 * 1000)) // 1ph
                .and()
                .signWith(getKey())
                .compact();
    }

    // Kiểm tra token có hợp lệ không (hết hạn hay không)
    public boolean validateToken(String token) {
        return !isTokenExpired(token);
    }

    // Tạo 1 SecretKey
    private SecretKey getKey() {
        byte[] keyBytes = secretkey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Lấy 1 claim từ token
    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    // Lấy tất cả claims từ token (Kiểm tra luôn cả chữ ký)
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Kiểm tra token có hết hạn không
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Lấy thời gian hết hạn của token
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
