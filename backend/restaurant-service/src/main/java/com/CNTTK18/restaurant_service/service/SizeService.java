package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.UUID;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.restaurant_service.dto.size.request.SizeRequest;
import com.CNTTK18.restaurant_service.model.Size;
import com.CNTTK18.restaurant_service.repository.SizeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SizeService {
    private final SizeRepository sizeRepo;

    public List<Size> getAllSize() {
        return sizeRepo.findAll();
    }

    public Size getSizeById(UUID id) {
        return sizeRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Size not found"));
    }

    @Transactional
    public Size createSize(SizeRequest sizeRequest) {
        Size size = Size.builder().name(sizeRequest.getName()).build();
        return sizeRepo.save(size);
    }

    @Transactional
    public Size updateSize(UUID id, SizeRequest sizeRequest) {
        Size size = getSizeById(id);
        size.setName(sizeRequest.getName());
        return sizeRepo.save(size);
    }

    @Transactional
    public void deleteSize(UUID id) {
        Size size = getSizeById(id);
        sizeRepo.delete(size);
    }
}
