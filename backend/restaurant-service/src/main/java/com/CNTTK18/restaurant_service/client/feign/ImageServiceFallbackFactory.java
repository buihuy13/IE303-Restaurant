package com.CNTTK18.restaurant_service.client.feign;

import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.restaurant_service.client.feign.dto.ImageUploadResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ImageServiceFallbackFactory implements FallbackFactory<ImageServiceFeignClient> {

    @Override
    public ImageServiceFeignClient create(Throwable cause) {
        return new ImageServiceFeignClient() {

            @Override
            public ImageUploadResponse uploadImage(MultipartFile file, String folder) {
                log.error("ImageService upload failed: {}", cause.getMessage());
                throw new RuntimeException("Failed to upload image. Please try again later.", cause);
            }

            @Override
            public void deleteImage(String publicId) {
                log.error("ImageService delete failed for {}: {}", publicId, cause.getMessage());
                // Don't throw for delete failures
            }
        };
    }
}
