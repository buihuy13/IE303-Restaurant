package com.CNTTK18.image_service.service;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface ImageService {
    Map<String, String> uploadImage(MultipartFile file, String folder);

    void deleteImage(String publicId);
}
