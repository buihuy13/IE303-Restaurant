package com.CNTTK18.image_service.service.impl;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.image_service.service.ImageService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {

    private final Cloudinary cloudinary;

    @Override
    public Map<String, String> uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap("folder", folder != null ? folder : "restaurant_app");
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), uploadParams);

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
