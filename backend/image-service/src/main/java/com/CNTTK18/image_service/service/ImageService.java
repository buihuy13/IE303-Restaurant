package com.CNTTK18.image_service.service;

import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.image_service.dto.request.TransformRequest;
import com.CNTTK18.image_service.dto.response.ImageUploadResponse;

public interface ImageService {
    ImageUploadResponse uploadImage(MultipartFile file, String folder);

    void deleteImage(String publicId);

    String getImageUrl(String publicId);

    String getTransformedUrl(TransformRequest request);
}
