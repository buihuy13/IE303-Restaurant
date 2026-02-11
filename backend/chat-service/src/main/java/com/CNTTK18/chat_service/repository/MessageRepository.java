package com.CNTTK18.chat_service.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.CNTTK18.chat_service.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE m.room.id = :roomId ORDER BY m.timestamp DESC")
    Page<Message> findByRoomIdWithPagination(@Param("roomId") UUID roomId, Pageable pageable);

    // Đếm total messages trong room
    @Query("SELECT COUNT(m) FROM Message m WHERE m.room.id = :roomId")
    long countByRoomId(UUID roomId);

    // Đếm tin nhắn chưa đọc trong room cho receiverId
    @Query("SELECT COUNT(m) FROM Message m WHERE m.room.id = :roomId AND m.receiverId = :receiverId AND m.read = false")
    Long countUnreadMessagesByRoomIdAndReceiverId(UUID roomId, UUID receiverId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :receiverId AND m.read = false")
    Long countUnreadMessagesByReceiverId(UUID receiverId);

    // Cập nhật tất cả tin nhắn trong room cho receiverId thành đã đọc
    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.room.id = :roomId "
            + "AND m.receiverId = :receiverId AND m.read = false")
    void updateReadByRoomIdAndReceiverId(UUID roomId, UUID receiverId);
}
