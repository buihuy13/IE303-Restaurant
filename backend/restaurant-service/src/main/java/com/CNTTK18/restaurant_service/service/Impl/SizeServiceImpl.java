package com.CNTTK18.restaurant_service.service.Impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.restaurant_service.dto.size.request.SizeRequest;
import com.CNTTK18.restaurant_service.model.Size;
import com.CNTTK18.restaurant_service.repository.SizeRepository;
import com.CNTTK18.restaurant_service.service.SizeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SizeServiceImpl implements SizeService {
    private final SizeRepository sizeRepo;

    @Override
    public List<Size> getAllSize() {
        return sizeRepo.findAll();
    }

    @Override
    public Size getSizeById(UUID id) {
        return sizeRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Size not found"));
    }

    @Transactional
    @Override
    public Size createSize(SizeRequest sizeRequest) {
        Size size = Size.builder().name(sizeRequest.getName()).build();
        return sizeRepo.save(size);
    }

    @Transactional
    @Override
    public Size updateSize(UUID id, SizeRequest sizeRequest) {
        Size size = getSizeById(id);
        size.setName(sizeRequest.getName());
        return sizeRepo.save(size);
    }

    @Transactional
    @Override
    public void deleteSize(UUID id) {
        Size size = getSizeById(id);
        sizeRepo.delete(size);
    }
}
