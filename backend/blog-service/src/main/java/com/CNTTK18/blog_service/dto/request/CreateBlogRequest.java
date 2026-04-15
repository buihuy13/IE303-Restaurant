package com.CNTTK18.blog_service.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
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
public class CreateBlogRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String coverImageUrl;

    private BlogStatus status;

    @Size(max = 240, message = "Excerpt must be at most 240 characters")
    private String excerpt;

    @Size(max = 120, message = "Category must be at most 120 characters")
    private String category;

    private List<String> tags;

    @Min(value = 1, message = "Read time must be at least 1 minute")
    private Integer readTime;

    private Boolean featured;

    @Size(max = 80, message = "Template key must be at most 80 characters")
    private String templateKey;

    @Size(max = 40, message = "Template version must be at most 40 characters")
    private String templateVersion;

    public CreateBlogRequest(String title, String content, String coverImageUrl, BlogStatus status) {
        this.title = title;
        this.content = content;
        this.coverImageUrl = coverImageUrl;
        this.status = status;
    }
}
