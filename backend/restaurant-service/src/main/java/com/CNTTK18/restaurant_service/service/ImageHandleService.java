package com.CNTTK18.restaurant_service.service;

import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface ImageHandleService {
    public Map<String, String> saveImageFile(MultipartFile file);

    public void deleteImage(String publicId);
}
