package com.CNTTK18.order_service.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import com.CNTTK18.order_service.dto.order.response.OrderResponse;

class RedisConfigTest {

    private final RedisConfig redisConfig = new RedisConfig();

    @Test
    void redisJsonSerializer_shouldSerializeAndDeserializeOrderResponseWithInstant() {
        GenericJackson2JsonRedisSerializer serializer = redisConfig.redisJsonSerializer();

        Instant createdAt = Instant.parse("2026-04-18T10:15:30.00Z");
        Instant updatedAt = Instant.parse("2026-04-18T11:00:00.00Z");

        OrderResponse original = OrderResponse.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .restaurantId(UUID.randomUUID())
                .restaurantName("Demo Restaurant")
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();

        byte[] serialized = serializer.serialize(original);
        Object deserialized = serializer.deserialize(serialized);

        OrderResponse restored = assertInstanceOf(OrderResponse.class, deserialized);
        assertEquals(createdAt, restored.getCreatedAt());
        assertEquals(updatedAt, restored.getUpdatedAt());
    }

    @Test
    void redisTemplate_shouldUseCustomRedisJsonSerializer() {
        RedisConnectionFactory redisConnectionFactory = mock(RedisConnectionFactory.class);
        GenericJackson2JsonRedisSerializer serializer = redisConfig.redisJsonSerializer();

        RedisTemplate<String, Object> redisTemplate = redisConfig.redisTemplate(redisConnectionFactory, serializer);

        assertSame(serializer, redisTemplate.getValueSerializer());
        assertSame(serializer, redisTemplate.getHashValueSerializer());
    }
}
