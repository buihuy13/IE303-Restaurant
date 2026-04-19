package com.CNTTK18.blog_service.dto.request;

import jakarta.validation.constraints.NotNull;

import com.CNTTK18.blog_service.model.data.BlogCommentStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateBlogCommentStatusRequest {
    @NotNull(message = "Status is required")
    private BlogCommentStatus status;
}
