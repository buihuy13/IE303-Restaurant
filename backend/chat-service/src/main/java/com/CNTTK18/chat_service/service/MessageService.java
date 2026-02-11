package com.CNTTK18.chat_service.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.chat_service.dto.MessageDTO;
import com.CNTTK18.chat_service.model.ChatRoom;
import com.CNTTK18.chat_service.model.Message;
import com.CNTTK18.chat_service.repository.ChatRoomRepository;
import com.CNTTK18.chat_service.repository.MessageRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String REDIS_CHANNEL = "messages";

    @Transactional
    public void processMessage(MessageDTO message) throws JsonProcessingException {
        saveMessageSync(message);

        // Publish to Redis
        publishToRedis(message);
    }

    public void saveMessageSync(MessageDTO message) {
        ChatRoom chatroom = chatRoomRepository
                .findById(message.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Chat room not found: " + message.getRoomId()));

        Message msg = Message.builder()
                .id(UUID.randomUUID())
                .room(chatroom)
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .build();

        // Cập nhật thời gian lastMessageTime và text lastMessage trong ChatRoom
        chatroom.setLastMessageTime(Instant.now());
        chatroom.setLastMessage(message.getContent());
        chatRoomRepository.save(chatroom);
        messageRepository.save(msg);
    }

    // Publish to Redis
    private void publishToRedis(MessageDTO message) throws JsonProcessingException {
        String messageJson = objectMapper.writeValueAsString(message);
        redisTemplate.convertAndSend(REDIS_CHANNEL, messageJson);
    }
}
