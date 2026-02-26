package com.CNTTK18.chat_service.service;

import java.util.UUID;

public interface TokenService {
    public String generateToken(UUID id);

    public boolean validateToken(String token);
}
