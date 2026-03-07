package com.CNTTK18.restaurant_service.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.RandomIdGenerator;
import com.CNTTK18.restaurant_service.dto.productSize.request.ProductSizeCreate;
import com.CNTTK18.restaurant_service.dto.productSize.request.ProductSizeRequest;
import com.CNTTK18.restaurant_service.dto.productSize.response.ProductSizeResponse;
import com.CNTTK18.restaurant_service.model.ProductSize;
import com.CNTTK18.restaurant_service.model.Products;
import com.CNTTK18.restaurant_service.model.Size;
import com.CNTTK18.restaurant_service.repository.ProductRepository;
import com.CNTTK18.restaurant_service.repository.ProductSizeRepository;
import com.CNTTK18.restaurant_service.repository.SizeRepository;
import com.CNTTK18.restaurant_service.util.ProductSizeUtil;

@Service
public class ProductSizeService {
    private final ProductSizeRepository productSizeRepository;
    private final ProductRepository productRepository;
    private final SizeRepository sizeRepository;

    public ProductSizeService(
            ProductSizeRepository productSizeRepository,
            ProductRepository productRepository,
            SizeRepository sizeRepository) {
        this.productSizeRepository = productSizeRepository;
        this.productRepository = productRepository;
        this.sizeRepository = sizeRepository;
    }

    public ProductSizeResponse getProductSizeById(String id) {
        ProductSize ps = productSizeRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find product details"));
        return ProductSizeUtil.mapProductSizeToProductSizeResponse(ps);
    }

    public Page<ProductSizeResponse> getProductSizes(String productId, String sizeId, Pageable pageable) {
        if (productId != null && !productId.isEmpty() && sizeId != null && !sizeId.isEmpty()) {
            return productSizeRepository
                    .findByProductIdAndSizeId(productId, sizeId, pageable)
                    .map(ProductSizeUtil::mapProductSizeToProductSizeResponse);
        }
        if (productId != null && !productId.isEmpty()) {
            return productSizeRepository
                    .findByProductId(productId, pageable)
                    .map(ProductSizeUtil::mapProductSizeToProductSizeResponse);
        }
        if (sizeId != null && !sizeId.isEmpty()) {
            return productSizeRepository
                    .findBySizeId(sizeId, pageable)
                    .map(ProductSizeUtil::mapProductSizeToProductSizeResponse);
        }
        return productSizeRepository.findAll(pageable).map(ProductSizeUtil::mapProductSizeToProductSizeResponse);
    }

    public ProductSizeResponse updateProductSize(String id, ProductSizeRequest request) {
        ProductSize ps = productSizeRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find product details"));

        ps.setPrice(request.getPrice());
        productSizeRepository.save(ps);
        return ProductSizeUtil.mapProductSizeToProductSizeResponse(ps);
    }

    public ProductSizeResponse createProductSize(ProductSizeCreate productSize) {
        Size size = sizeRepository
                .findById(productSize.getSizeId())
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find size"));

        Products product = productRepository
                .findById(productSize.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find product"));

        ProductSize ps = new ProductSize(RandomIdGenerator.generate(254), product, size, productSize.getPrice());
        productSizeRepository.save(ps);
        return ProductSizeUtil.mapProductSizeToProductSizeResponse(ps);
    }

    public void deleteProductSize(String id) {
        ProductSize ps = productSizeRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find product details"));

        productSizeRepository.delete(ps);
    }
}
