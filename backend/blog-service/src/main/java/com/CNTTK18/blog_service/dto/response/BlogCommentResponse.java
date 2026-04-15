package com.CNTTK18.blog_service.dto.response;

import java.time.ZonedDateTime;
import java.util.UUID;

import com.CNTTK18.blog_service.model.data.BlogCommentStatus;
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
public class BlogCommentResponse {
    private UUID id;
    private UUID blogId;
    private UUID authorId;
    private String name;
    private String email;
    private String message;
    private Boolean notify;
    private BlogCommentStatus status;

    @JsonSerialize(using = ZonedDateTimeSerializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private ZonedDateTime createdAt;
}
