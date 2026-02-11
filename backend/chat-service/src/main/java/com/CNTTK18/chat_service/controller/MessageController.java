package com.CNTTK18.chat_service.controller;

import java.time.Instant;

import jakarta.validation.Valid;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.CNTTK18.chat_service.dto.MessageDTO;
import com.CNTTK18.chat_service.service.MessageService;
import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class MessageController {
    private MessageService messageService;

    // Cần tiền tố /app -> /app/chat.sendMessage
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Valid @Payload MessageDTO message) throws JsonProcessingException {
        message.setTimestamp(Instant.now());
        messageService.processMessage(message);
    }
}
