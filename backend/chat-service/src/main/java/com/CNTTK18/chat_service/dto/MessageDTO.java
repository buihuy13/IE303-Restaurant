package com.CNTTK18.chat_service.dto;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MessageDTO {
    private UUID roomId;

    @NotBlank
    private UUID senderId;

    @NotBlank
    private UUID receiverId;

    @NotBlank
    private String content;

    private Instant timestamp;
}
