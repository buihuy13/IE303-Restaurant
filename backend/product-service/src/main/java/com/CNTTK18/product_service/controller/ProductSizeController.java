package com.CNTTK18.product_service.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.product_service.dto.productSize.request.ProductSizeCreate;
import com.CNTTK18.product_service.dto.productSize.request.ProductSizeRequest;
import com.CNTTK18.product_service.dto.productSize.response.ProductSizeResponse;
import com.CNTTK18.product_service.service.ProductSizeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/productsize")
@RequiredArgsConstructor
public class ProductSizeController {
    private final ProductSizeService productSizeService;

    @Tag(name = "Get")
    @Operation(summary = "Get product size by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProductSizeResponse> getProductSizeById(@PathVariable UUID id) {
        return ResponseEntity.ok(productSizeService.getProductSizeById(id));
    }

    @Tag(name = "Post")
    @Operation(summary = "Create new product size")
    @PostMapping("")
    public ResponseEntity<ProductSizeResponse> createProductSize(@Valid @RequestBody ProductSizeCreate productSize) {
        return new ResponseEntity<>(productSizeService.createProductSize(productSize), HttpStatus.CREATED);
    }

    @Tag(name = "Put")
    @Operation(summary = "Update product size")
    @PutMapping("/{id}")
    public ResponseEntity<ProductSizeResponse> updateProductSize(
            @PathVariable UUID id, @Valid @RequestBody ProductSizeRequest request) {
        return ResponseEntity.ok(productSizeService.updateProductSize(id, request));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete product size")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductSize(@PathVariable UUID id) {
        productSizeService.deleteProductSize(id);
        return ResponseEntity.noContent().build();
    }
}
