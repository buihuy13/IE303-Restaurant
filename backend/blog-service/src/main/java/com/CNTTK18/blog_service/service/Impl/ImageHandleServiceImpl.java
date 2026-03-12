package com.CNTTK18.blog_service.service.Impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.blog_service.service.ImageHandleService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageHandleServiceImpl implements ImageHandleService {
    private static final String KEY_PUBLIC_ID = "public_id";
    private static final String KEY_URL = "url";

    private final Cloudinary cloudinary;

    @Override
    public Map<String, String> saveImageFile(MultipartFile file) {
        validateFile(file);
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            Map<String, String> response = new HashMap<>();
            response.put(KEY_PUBLIC_ID, (String) result.get("public_id"));
            response.put(KEY_URL, (String) result.get("secure_url"));
            return response;
        } catch (IOException ex) {
            throw new RuntimeException("Cannot upload file to Cloudinary", ex);
        }
    }

    @Override
    public List<Map<String, String>> saveImageFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }
        List<Map<String, String>> uploadedImages = new ArrayList<>(files.size());
        for (MultipartFile file : files) {
            uploadedImages.add(saveImageFile(file));
        }
        return uploadedImages;
    }

    @Override
    public void deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException ex) {
            throw new RuntimeException("Cannot delete file from Cloudinary", ex);
        }
    }

    @Override
    public void deleteImages(List<String> publicIds) {
        if (publicIds == null || publicIds.isEmpty()) {
            return;
        }
        for (String publicId : publicIds) {
            deleteImage(publicId);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
    }
}
