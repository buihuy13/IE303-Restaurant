package com.CNTTK18.chat_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.CNTTK18.chat_service.model.ChatRoom;

import io.lettuce.core.dynamic.annotation.Param;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID>, JpaSpecificationExecutor<ChatRoom> {
    @Query(
            "select m.user1Id, m.user2Id from ChatRoom m where m.user1Id = :userId or m.user2Id = :userId and m.lastMessage IS NOT NULL "
                    + "order by m.lastMessageTime desc")
    List<Object[]> findUsersIdChatWithUser(@Param("userId") UUID userId);

    @Query("select m from ChatRoom m where (m.user1Id = :userId or m.user2Id = :userId) "
            + "and m.lastMessage IS NOT NULL order by m.lastMessageTime desc")
    Page<ChatRoom> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);
}
