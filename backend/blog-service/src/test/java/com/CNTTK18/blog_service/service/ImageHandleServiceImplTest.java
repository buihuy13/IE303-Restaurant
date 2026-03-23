package com.CNTTK18.blog_service.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.CNTTK18.blog_service.config.properties.BlogImageProperties;
import com.CNTTK18.blog_service.service.Impl.ImageHandleServiceImpl;
import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;

@ExtendWith(MockitoExtension.class)
class ImageHandleServiceImplTest {
    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    private BlogImageProperties blogImageProperties;
    private ImageHandleServiceImpl imageHandleService;

    @BeforeEach
    void setUp() {
        blogImageProperties = new BlogImageProperties();
        blogImageProperties.setMaxFilesPerUpload(2);
        blogImageProperties.setMaxFileSizeBytes(1024);
        blogImageProperties.setAllowedContentTypes(List.of("image/png", "image/jpeg"));

        imageHandleService = new ImageHandleServiceImpl(cloudinary, blogImageProperties);
        lenient().when(cloudinary.uploader()).thenReturn(uploader);
    }

    @Test
    void saveImageFiles_shouldRejectTooManyFiles() {
        MockMultipartFile file1 = new MockMultipartFile("images", "a.png", "image/png", new byte[] {1});
        MockMultipartFile file2 = new MockMultipartFile("images", "b.png", "image/png", new byte[] {1});
        MockMultipartFile file3 = new MockMultipartFile("images", "c.png", "image/png", new byte[] {1});

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class, () -> imageHandleService.saveImageFiles(List.of(file1, file2, file3)));

        assertEquals("Too many images in one upload request", exception.getMessage());
    }

    @Test
    void saveImageFile_shouldRejectUnsupportedContentType() {
        MockMultipartFile invalidTypeFile =
                new MockMultipartFile("images", "note.txt", "text/plain", "not-image".getBytes());

        IllegalArgumentException exception =
                assertThrows(IllegalArgumentException.class, () -> imageHandleService.saveImageFile(invalidTypeFile));

        assertEquals("Unsupported image type: text/plain", exception.getMessage());
    }

    @Test
    void saveImageFile_shouldRejectOversizedFile() {
        byte[] content = new byte[2048];
        MockMultipartFile oversizedFile = new MockMultipartFile("images", "big.png", "image/png", content);

        IllegalArgumentException exception =
                assertThrows(IllegalArgumentException.class, () -> imageHandleService.saveImageFile(oversizedFile));

        assertEquals("Image file exceeds maximum allowed size", exception.getMessage());
    }

    @Test
    void saveImageFile_shouldRejectMissingContentType() {
        MockMultipartFile missingContentType = new MockMultipartFile("images", "file.bin", null, new byte[] {1});

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class, () -> imageHandleService.saveImageFile(missingContentType));

        assertEquals("Image content type is required", exception.getMessage());
    }

    @Test
    void saveImageFile_shouldReturnUploadedImageMetadata() throws IOException {
        MockMultipartFile validFile = new MockMultipartFile("images", "ok.png", "image/png", new byte[] {1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap()))
                .thenReturn(Map.of("public_id", "cloud-public-id", "secure_url", "https://cloud.test/ok.png"));

        Map<String, String> response = imageHandleService.saveImageFile(validFile);

        assertEquals("cloud-public-id", response.get("public_id"));
        assertEquals("https://cloud.test/ok.png", response.get("url"));
        verify(uploader).upload(any(byte[].class), anyMap());
    }

    @Test
    void deleteImage_shouldSkipWhenPublicIdBlank() throws IOException {
        imageHandleService.deleteImage(" ");

        verify(uploader, never()).destroy(any(), anyMap());
    }

    @Test
    void deleteImage_shouldCallCloudinaryDestroy() throws IOException {
        when(uploader.destroy(eq("public-to-delete"), anyMap())).thenReturn(Map.of("result", "ok"));

        imageHandleService.deleteImage("public-to-delete");

        verify(uploader).destroy(eq("public-to-delete"), anyMap());
    }
}
