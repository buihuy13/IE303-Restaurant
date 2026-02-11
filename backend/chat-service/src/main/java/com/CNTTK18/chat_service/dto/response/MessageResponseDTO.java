package com.CNTTK18.chat_service.dto.response;

import java.time.ZonedDateTime;
import java.util.UUID;

import jakarta.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class MessageResponseDTO {
    @Id
    private UUID id;

    private UUID senderId;
    private UUID receiverId;
    private String content;
    private ZonedDateTime timestamp;
    private boolean read;
}
