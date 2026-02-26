package com.CNTTK18.chat_service.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.CNTTK18.chat_service.dto.request.RoomDTO;
import com.CNTTK18.chat_service.dto.response.MessageResponseDTO;
import com.CNTTK18.chat_service.model.ChatRoom;

public interface ChatMessageService {
    public UUID getRoomId(RoomDTO roomDTO);

    public Page<MessageResponseDTO> getRecentMessageByPagination(UUID roomId, Pageable pageable);

    public Page<ChatRoom> findAllRoomByUserId(UUID userId, Pageable pageable);

    public long countUnreadMessagesByReceiverId(UUID receiverId);

    public long countUnreadMessagesByRoomIdAndReceiverId(UUID roomId, UUID receiverId);

    public void markMessagesAsRead(UUID roomId, UUID receiverId);

    public String generateOneTimeToken(UUID userid);
}
