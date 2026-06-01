package com.CNTTK18.Common.Exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s không được tìm thấy với %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
