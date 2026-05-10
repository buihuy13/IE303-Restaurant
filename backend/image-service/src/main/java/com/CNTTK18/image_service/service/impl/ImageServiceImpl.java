package com.CNTTK18.image_service.service.impl;

import java.io.IOException;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.image_service.dto.request.TransformRequest;
import com.CNTTK18.image_service.dto.response.ImageUploadResponse;
import com.CNTTK18.image_service.service.ImageService;
import com.CNTTK18.image_service.storage.ImageStorageProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {

    private final ImageStorageProvider storageProvider;

    @Override
    @CacheEvict(value = "images", allEntries = true)
    public ImageUploadResponse uploadImage(MultipartFile file, String folder) {
        try {
            byte[] imageData = file.getBytes();
            String fileName = file.getOriginalFilename();

            ImageStorageProvider.ImageUploadResult result = storageProvider.upload(imageData, fileName, folder);

            return ImageUploadResponse.builder()
                    .publicId(result.publicId())
                    .url(result.url())
                    .secureUrl(result.secureUrl())
                    .width(result.width())
                    .height(result.height())
                    .format(result.format())
                    .bytes(result.bytes())
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to process image file", e);
        }
    }

    @Override
    @CacheEvict(value = "images", allEntries = true)
    public void deleteImage(String publicId) {
        storageProvider.delete(publicId);
    }

    @Override
    @Cacheable(value = "images", key = "#publicId")
    public String getImageUrl(String publicId) {
        return storageProvider.getUrl(publicId);
    }

    @Override
    public String getTransformedUrl(TransformRequest request) {
        return storageProvider.getTransformedUrl(request.getPublicId(), request.getTransformations());
    }
}
