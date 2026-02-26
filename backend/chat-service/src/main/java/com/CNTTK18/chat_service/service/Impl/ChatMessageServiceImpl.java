package com.CNTTK18.chat_service.service.Impl;

import java.util.UUID;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.CNTTK18.chat_service.dto.request.RoomDTO;
import com.CNTTK18.chat_service.dto.response.MessageResponseDTO;
import com.CNTTK18.chat_service.mapper.MessageMapper;
import com.CNTTK18.chat_service.model.ChatRoom;
import com.CNTTK18.chat_service.repository.ChatRoomRepository;
import com.CNTTK18.chat_service.repository.MessageRepository;
import com.CNTTK18.chat_service.service.ChatMessageService;
import com.CNTTK18.chat_service.service.TokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageServiceImpl implements ChatMessageService {
    private final MessageRepository messageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final MessageMapper messageMapper;
    private final TokenService tokenService;

    // Tạo room nếu chưa có, trả về roomId
    @Transactional
    @Override
    public UUID getRoomId(RoomDTO roomDTO) {
        UUID roomId = UUID.fromString(roomDTO.getUserId1() + "_" + roomDTO.getUserId2());
        if (roomDTO.getUserId1().compareTo(roomDTO.getUserId2()) > 0) {
            return findOrCreateNewRoom(roomDTO, roomId);
        }
        roomId = UUID.fromString(roomDTO.getUserId2() + "_" + roomDTO.getUserId1());
        return findOrCreateNewRoom(roomDTO, roomId);
    }

    @Override
    public Page<MessageResponseDTO> getRecentMessageByPagination(UUID roomId, Pageable pageable) {
        return messageRepository.findByRoomIdWithPagination(roomId, pageable).map(messageMapper::toMessageResponse);
    }

    // Lấy tất cả room có userId tham gia
    @Override
    public Page<ChatRoom> findAllRoomByUserId(UUID userId, Pageable pageable) {
        return chatRoomRepository.findAllByUserId(userId, pageable);
    }

    // Đếm số tin nhắn chưa đọc trong box chat của userId
    @Override
    public long countUnreadMessagesByReceiverId(UUID receiverId) {
        return messageRepository.countUnreadMessagesByReceiverId(receiverId);
    }

    // Đếm số tin nhắn chưa đọc trong room cho receiverId
    @Override
    public long countUnreadMessagesByRoomIdAndReceiverId(UUID roomId, UUID receiverId) {
        return messageRepository.countUnreadMessagesByRoomIdAndReceiverId(roomId, receiverId);
    }

    // Đánh dấu tất cả tin nhắn trong room là đã đọc
    @Override
    @Transactional
    public void markMessagesAsRead(UUID roomId, UUID receiverId) {
        messageRepository.updateReadByRoomIdAndReceiverId(roomId, receiverId);
    }

    @Override
    public String generateOneTimeToken(UUID userid) {
        return tokenService.generateToken(userid);
    }

    private UUID findOrCreateNewRoom(RoomDTO roomDTO, UUID roomId) {
        if (chatRoomRepository.findById(roomId).isEmpty()) {
            chatRoomRepository.save(new ChatRoom(roomId, roomDTO.getUserId1(), roomDTO.getUserId2(), null, null));
        }
        return roomId;
    }
}
