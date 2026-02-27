package com.CNTTK18.chat_service.service.Impl;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.CNTTK18.chat_service.service.RedisService;

@Service
public class RedisServiceImpl implements RedisService {
    @Qualifier("objectRedisTemplate")
    private final RedisTemplate<String, String> redisTemplate;

    public RedisServiceImpl(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void setValue(String key, String value) {
        redisTemplate.opsForValue().set(key, value, 60, TimeUnit.SECONDS);
    }

    @Override
    public String getValue(String key) {
        return (String) redisTemplate.opsForValue().get(key);
    }

    @Override
    public void deleteValue(String key) {
        redisTemplate.delete(key);
    }

    // Kiểm tra xem token đó đã được dùng chưa
    @SuppressWarnings("null")
    @Override
    public Boolean exists(String key) {
        return redisTemplate.hasKey(key) && redisTemplate.opsForValue().get(key).equals(true);
    }
}
