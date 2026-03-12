package com.CNTTK18.blog_service.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface ImageHandleService {
    Map<String, String> saveImageFile(MultipartFile file);

    List<Map<String, String>> saveImageFiles(List<MultipartFile> files);

    void deleteImage(String publicId);

    void deleteImages(List<String> publicIds);
}
