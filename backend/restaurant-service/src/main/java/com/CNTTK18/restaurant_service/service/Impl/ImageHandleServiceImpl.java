package com.CNTTK18.restaurant_service.service.Impl;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.restaurant_service.service.ImageHandleService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageHandleServiceImpl implements ImageHandleService {
    private final Cloudinary cloudinary;

    @Override
    public Map<String, String> saveImageFile(MultipartFile file) {
        try {
            // Tải file lên Cloudinary và nhận kết quả
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());

            Map<String, String> res = new HashMap<>();
            res.put("public_id", (String) result.get("public_id"));
            res.put("url", (String) result.get("secure_url"));
            return res;
        } catch (IOException ex) {
            throw new RuntimeException("Không thể tải file lên", ex);
        }
    }

    @Override
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Không thể xóa file.", e);
        }
    }
}
