package com.CNTTK18.auth_service.mapper;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.CNTTK18.auth_service.dto.response.UserResponse;
import com.CNTTK18.auth_service.model.Users;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "convertToVNZone")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "convertToVNZone")
    @Mapping(target = "activatedAt", source = "activatedAt", qualifiedByName = "convertToVNZone")
    UserResponse toUserResponse(Users user);

    @Named("convertToVNZone")
    default ZonedDateTime convertToVNZone(Instant instant) {
        if (instant == null) return null;
        return instant.atZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    }
}
