package com.CNTTK18.image_service.dto.request;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransformRequest {
    @NotBlank(message = "publicId is required")
    private String publicId;

    private Map<String, Object> transformations;
}
