package com.CNTTK18.chat_service.config;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.CNTTK18.chat_service.dto.MessageDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class RedisMessageSubscriber {
    // Sử dụng để kết nối từ redis qua websocket client
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    // Phương thức nhận từ redisConfig và forward cho các websocket clients
    public void receiveMessage(String message) {
        try {
            // Chuyển từ Json qua Message
            MessageDTO chatMessage = objectMapper.readValue(message, MessageDTO.class);

            // Forward đến các clients qua WebSocket (Gửi đến các client đang subscribe topic của
            // room có giá trị là destination)
            String destination = "/topic/room/" + chatMessage.getRoomId();
            messagingTemplate.convertAndSend(destination, chatMessage);
        } catch (Exception e) {
            log.error("Error processing Redis message", e);
        }
    }
}
