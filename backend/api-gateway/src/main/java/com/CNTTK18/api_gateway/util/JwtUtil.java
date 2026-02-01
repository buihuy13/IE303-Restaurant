package com.CNTTK18.api_gateway.util;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
    @Value("${jwt.secretkey}")
    private String secretkey;

    // Tạo 1 SecretKey
    private SecretKey getKey() {
        byte[] keyBytes = secretkey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role").toString();
    }

    public String extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("id").toString();
    }

    // Lấy 1 claim từ token
    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    // Lấy tất cả claims từ token (Kiểm tra luôn cả chữ ký)
    private Claims extractAllClaims(String token) {
        var jwt = Jwts.parser();
        jwt = jwt.verifyWith(getKey());
        return jwt.build().parseSignedClaims(token).getPayload();
    }

    // Kiểm tra token có hợp lệ không (hết hạn hay không)
    public boolean validateToken(String token) {
        return !isTokenExpired(token);
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
