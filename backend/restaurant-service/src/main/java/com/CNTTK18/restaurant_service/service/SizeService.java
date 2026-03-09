package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.UUID;

import com.CNTTK18.restaurant_service.dto.size.request.SizeRequest;
import com.CNTTK18.restaurant_service.model.Size;

public interface SizeService {
    public List<Size> getAllSize();

    public Size getSizeById(UUID id);

    public Size createSize(SizeRequest sizeRequest);

    public Size updateSize(UUID id, SizeRequest sizeRequest);

    public void deleteSize(UUID id);
}
