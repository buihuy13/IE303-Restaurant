package com.CNTTK18.image_service.storage;

import java.util.Map;

public interface ImageStorageProvider {
    ImageUploadResult upload(byte[] imageData, String fileName, String folder);

    void delete(String publicId);

    String getUrl(String publicId);

    String getTransformedUrl(String publicId, Map<String, Object> transformations);

    record ImageUploadResult(
            String publicId, String url, String secureUrl, Integer width, Integer height, String format, Long bytes) {}
}
