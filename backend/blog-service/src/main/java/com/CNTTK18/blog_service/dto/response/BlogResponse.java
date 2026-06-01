package com.CNTTK18.blog_service.dto.response;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

import com.CNTTK18.blog_service.model.data.BlogStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.ZonedDateTimeSerializer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogResponse {
    private UUID id;
    private UUID authorId;
    private String title;
    private String slug;
    private String content;
    private String coverImageUrl;
    private String excerpt;
    private String category;
    private List<String> tags;
    private Integer readTime;
    private Boolean featured;
    private Long viewsCount;
    private Long likesCount;
    private Long commentsCount;
    private Boolean likedByCurrentUser;
    private String authorName;
    private String authorAvatarUrl;
    private String authorRole;
    private String templateKey;
    private String templateVersion;
    private BlogStatus status;

    @JsonSerialize(using = ZonedDateTimeSerializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private ZonedDateTime publishedAt;

    @JsonSerialize(using = ZonedDateTimeSerializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private ZonedDateTime createdAt;

    @JsonSerialize(using = ZonedDateTimeSerializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private ZonedDateTime updatedAt;
}
