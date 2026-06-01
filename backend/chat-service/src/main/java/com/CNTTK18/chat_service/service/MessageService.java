package com.CNTTK18.chat_service.service;

import com.CNTTK18.chat_service.dto.MessageDTO;
import com.fasterxml.jackson.core.JsonProcessingException;

public interface MessageService {
    public void processMessage(MessageDTO message) throws JsonProcessingException;
}
