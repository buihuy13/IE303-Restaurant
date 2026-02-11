package com.CNTTK18.chat_service.mapper;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.CNTTK18.chat_service.dto.response.MessageResponseDTO;
import com.CNTTK18.chat_service.model.Message;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    @Mapping(target = "timestamp", source = "timestamp", qualifiedByName = "convertToVNZone")
    MessageResponseDTO toMessageResponse(Message message);

    @Named("convertToVNZone")
    default ZonedDateTime convertToVNZone(Instant instant) {
        if (instant == null) return null;
        return instant.atZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    }
}
