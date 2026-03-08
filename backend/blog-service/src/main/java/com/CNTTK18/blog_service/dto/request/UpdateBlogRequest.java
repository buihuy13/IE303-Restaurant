package com.CNTTK18.blog_service.dto.request;

import jakarta.validation.constraints.Size;

import com.CNTTK18.blog_service.model.data.BlogStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBlogRequest {
    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    private String content;

    private String coverImageUrl;

    private BlogStatus status;
}
