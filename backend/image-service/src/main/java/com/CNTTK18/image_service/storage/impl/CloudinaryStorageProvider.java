package com.CNTTK18.image_service.storage.impl;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.CNTTK18.image_service.storage.ImageStorageProvider;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CloudinaryStorageProvider implements ImageStorageProvider {

    private final Cloudinary cloudinary;

    @Override
    public ImageUploadResult upload(byte[] imageData, String fileName, String folder) {
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap("folder", folder != null ? folder : "restaurant_app");

            Map<?, ?> result = cloudinary.uploader().upload(imageData, uploadParams);

            return new ImageUploadResult(
                    (String) result.get("public_id"),
                    (String) result.get("url"),
                    (String) result.get("secure_url"),
                    (Integer) result.get("width"),
                    (Integer) result.get("height"),
                    (String) result.get("format"),
                    (Long) result.get("bytes"));
        } catch (IOException ex) {
            throw new RuntimeException("Failed to upload image to Cloudinary", ex);
        }
    }

    @Override
    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image from Cloudinary", e);
        }
    }

    @Override
    public String getUrl(String publicId) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload("", ObjectUtils.asMap("public_id", publicId));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to get image URL from Cloudinary", e);
        }
    }

    @Override
    public String getTransformedUrl(String publicId, Map<String, Object> transformations) {
        try {
            String transformationString = buildTransformationString(transformations);
            return cloudinary
                    .url()
                    .publicId(publicId)
                    .transformation(new com.cloudinary.Transformation())
                    .generate()
                    .replace("/upload/", "/upload/" + transformationString + "/");
        } catch (Exception e) {
            throw new RuntimeException("Failed to get transformed image URL", e);
        }
    }

    private String buildTransformationString(Map<String, Object> transformations) {
        if (transformations == null || transformations.isEmpty()) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, Object> entry : transformations.entrySet()) {
            sb.append(entry.getKey()).append("_").append(entry.getValue()).append(",");
        }
        if (sb.length() > 0) {
            sb.setLength(sb.length() - 1);
        }
        return sb.toString();
    }
}
