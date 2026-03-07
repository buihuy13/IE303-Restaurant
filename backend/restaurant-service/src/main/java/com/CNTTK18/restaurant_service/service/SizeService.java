package com.CNTTK18.restaurant_service.service;

import java.util.HashSet;
import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.RandomIdGenerator;
import com.CNTTK18.restaurant_service.dto.size.request.SizeRequest;
import com.CNTTK18.restaurant_service.model.Size;
import com.CNTTK18.restaurant_service.repository.SizeRepository;

@Service
public class SizeService {
    private SizeRepository sizeRepo;

    public SizeService(SizeRepository sizeRepo) {
        this.sizeRepo = sizeRepo;
    }

    public List<Size> getAllSize() {
        return sizeRepo.findAll();
    }

    public Size getSizeById(String id) {
        Size size = sizeRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Size not found"));
        return size;
    }

    @Transactional
    public Size createSize(SizeRequest sizeRequest) {
        Size size = new Size(RandomIdGenerator.generate(5), sizeRequest.getName(), new HashSet<>());
        return sizeRepo.save(size);
    }

    @Transactional
    public Size updateSize(String id, SizeRequest sizeRequest) {
        Size size = sizeRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Size not found"));
        size.setName(sizeRequest.getName());
        return sizeRepo.save(size);
    }

    @Transactional
    public void deleteSize(String id) {
        Size size = sizeRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Size not found"));
        sizeRepo.delete(size);
    }
}
