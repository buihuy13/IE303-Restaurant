package com.CNTTK18.product_service.service.Impl;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.product_service.client.feign.CatalogServiceFeignClient;
import com.CNTTK18.product_service.client.feign.dto.SizeResponse;
import com.CNTTK18.product_service.dto.productSize.request.ProductSizeCreate;
import com.CNTTK18.product_service.dto.productSize.request.ProductSizeRequest;
import com.CNTTK18.product_service.dto.productSize.response.ProductSizeResponse;
import com.CNTTK18.product_service.mapper.ProductSizeMapper;
import com.CNTTK18.product_service.model.ProductSize;
import com.CNTTK18.product_service.model.Products;
import com.CNTTK18.product_service.repository.ProductRepository;
import com.CNTTK18.product_service.repository.ProductSizeRepository;
import com.CNTTK18.product_service.service.ProductSizeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductSizeServiceImpl implements ProductSizeService {
    private final ProductSizeRepository productSizeRepository;
    private final ProductRepository productRepository;
    private final CatalogServiceFeignClient catalogServiceClient;
    private final ProductSizeMapper productSizeMapper;

    @Override
    public ProductSizeResponse getProductSizeById(UUID id) {
        ProductSize ps = getById(id);
        return productSizeMapper.toProductSizeResponse(ps);
    }

    @Override
    public ProductSizeResponse updateProductSize(UUID id, ProductSizeRequest request) {
        ProductSize ps = getById(id);
        ps.setPrice(request.getPrice());
        productSizeRepository.save(ps);
        return productSizeMapper.toProductSizeResponse(ps);
    }

    @Override
    @Transactional
    public ProductSizeResponse createProductSize(ProductSizeCreate productSize) {
        @SuppressWarnings("unused")
        SizeResponse size = catalogServiceClient.getSize(productSize.getSizeId());

        Products product = productRepository
                .findById(productSize.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find product"));

        ProductSize ps = ProductSize.builder()
                .product(product)
                .sizeId(productSize.getSizeId())
                .price(productSize.getPrice())
                .build();

        productSizeRepository.save(ps);
        return productSizeMapper.toProductSizeResponse(ps);
    }

    @Override
    @Transactional
    public void deleteProductSize(UUID id) {
        ProductSize ps = getById(id);
        productSizeRepository.delete(ps);
    }

    private ProductSize getById(UUID id) {
        ProductSize ps = productSizeRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find product details"));
        return ps;
    }
}
