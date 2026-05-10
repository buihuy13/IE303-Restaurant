package com.CNTTK18.catalog_service.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.catalog_service.dto.size.request.SizeRequest;
import com.CNTTK18.catalog_service.dto.size.response.SizeResponse;
import com.CNTTK18.catalog_service.mapper.SizeMapper;
import com.CNTTK18.catalog_service.model.Size;
import com.CNTTK18.catalog_service.repository.SizeRepository;
import com.CNTTK18.catalog_service.service.SizeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SizeServiceImpl implements SizeService {

    private final SizeRepository sizeRepository;
    private final SizeMapper sizeMapper;

    @Override
    @Cacheable(value = "sizes", key = "'all'")
    public List<SizeResponse> getAllSizes() {
        return sizeRepository.findAll().stream().map(sizeMapper::toSizeResponse).toList();
    }

    @Override
    @Cacheable(value = "sizes", key = "#id")
    public SizeResponse getSizeById(UUID id) {
        Size size = getSizeEntityById(id);
        return sizeMapper.toSizeResponse(size);
    }

    @Transactional
    @Override
    @CacheEvict(value = "sizes", allEntries = true)
    public SizeResponse createSize(SizeRequest sizeRequest) {
        if (sizeRepository.existsByName(sizeRequest.getName())) {
            throw new RuntimeException("Size already exists with name: " + sizeRequest.getName());
        }
        Size size = Size.builder().name(sizeRequest.getName()).build();
        Size savedSize = sizeRepository.save(size);
        return sizeMapper.toSizeResponse(savedSize);
    }

    @Transactional
    @Override
    @CacheEvict(value = "sizes", allEntries = true)
    public SizeResponse updateSize(UUID id, SizeRequest sizeRequest) {
        Size size = getSizeEntityById(id);

        if (!size.getName().equals(sizeRequest.getName()) && sizeRepository.existsByName(sizeRequest.getName())) {
            throw new RuntimeException("Size already exists with name: " + sizeRequest.getName());
        }

        size.setName(sizeRequest.getName());
        Size updatedSize = sizeRepository.save(size);
        return sizeMapper.toSizeResponse(updatedSize);
    }

    @Transactional
    @Override
    @CacheEvict(value = "sizes", allEntries = true)
    public void deleteSize(UUID id) {
        Size size = getSizeEntityById(id);
        sizeRepository.delete(size);
    }

    private Size getSizeEntityById(UUID id) {
        return sizeRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Size not found with id: " + id));
    }
}
