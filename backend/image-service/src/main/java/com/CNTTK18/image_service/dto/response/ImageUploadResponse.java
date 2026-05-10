package com.CNTTK18.image_service.dto.response;

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
public class ImageUploadResponse {
    private String publicId;
    private String url;
    private String secureUrl;
    private Integer width;
    private Integer height;
    private String format;
    private Long bytes;
}
