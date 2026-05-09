package com.CNTTK18.blog_service.mapper;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.CNTTK18.blog_service.dto.response.BlogResponse;
import com.CNTTK18.blog_service.model.BlogPost;

@Mapper(componentModel = "spring")
public interface BlogMapper {
    @Mapping(target = "publishedAt", source = "publishedAt", qualifiedByName = "convertToVNZone")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "convertToVNZone")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "convertToVNZone")
    @Mapping(target = "likedByCurrentUser", ignore = true)
    @Mapping(target = "authorName", ignore = true)
    @Mapping(target = "authorAvatarUrl", ignore = true)
    @Mapping(target = "authorRole", ignore = true)
    BlogResponse toBlogResponse(BlogPost blogPost);

    @Named("convertToVNZone")
    default ZonedDateTime convertToVNZone(Instant instant) {
        if (instant == null) return null;
        return instant.atZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    }
}
