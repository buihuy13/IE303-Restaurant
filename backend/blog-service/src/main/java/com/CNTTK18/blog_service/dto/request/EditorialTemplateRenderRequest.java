package com.CNTTK18.blog_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EditorialTemplateRenderRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    @NotBlank(message = "Topic is required")
    @Size(max = 255, message = "Topic must be at most 255 characters")
    private String topic;

    @Size(max = 40, message = "Language must be at most 40 characters")
    private String language;

    @Size(max = 120, message = "Category must be at most 120 characters")
    private String category;
}
