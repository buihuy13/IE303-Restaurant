package com.CNTTK18.restaurant_service.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.product.request.ProductRequest;
import com.CNTTK18.restaurant_service.dto.product.request.UpdateProduct;
import com.CNTTK18.restaurant_service.dto.product.response.ProductResponse;
import com.CNTTK18.restaurant_service.dto.response.MessageResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.request.Coordinates;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.model.ProductSize;
import com.CNTTK18.restaurant_service.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @Tag(name = "Get")
    @Operation(summary = "Get all products")
    @GetMapping("")
    public Mono<ResponseEntity<Page<ProductResponse>>> getAllProducts(
            @RequestParam(required = false) String rating,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer nearby,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) String locationsorted,
            Pageable pageable) {

        Coordinates location = null;
        if (lon != null && lat != null) {
            location = new Coordinates(lon, lat);
        }
        return productService
                .getAllProducts(
                        rating, category, minPrice, maxPrice, search, nearby, location, locationsorted, pageable)
                .map(productList -> ResponseEntity.ok(productList));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get product by ID")
    @GetMapping("/admin/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get product by Slug")
    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @Tag(name = "Post")
    @Operation(summary = "Create new product")
    @PostMapping("")
    public ResponseEntity<ProductResponse> createProduct(
            @RequestPart(value = "product", required = true) @Valid ProductRequest productRequest,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        return new ResponseEntity<>(
                productService.createProduct(productRequest, imageFile), HttpStatusCode.valueOf(201));
    }

    @Tag(name = "Put")
    @Operation(summary = "Update a product")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @RequestPart(value = "product", required = true) @Valid UpdateProduct updateProduct,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @PathVariable UUID id,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(productService.updateProduct(updateProduct, id, imageFile, authUser));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete a product")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteProduct(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        productService.deleteProduct(id, authUser);
        return ResponseEntity.ok(new MessageResponse("Delete Successfully"));
    }

    @Tag(name = "Put")
    @Operation(summary = "Update a product available status")
    @PutMapping("/availability/{id}")
    public ResponseEntity<MessageResponse> updateProductAvailability(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        productService.changeProductAvailability(id, authUser);
        return ResponseEntity.ok(new MessageResponse("Update availability successfully"));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete product image")
    @DeleteMapping("/image/{id}")
    public ResponseEntity<MessageResponse> deleteProductImage(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        productService.deleteImage(id, authUser);
        return ResponseEntity.ok(new MessageResponse("Delete image successfully"));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get all product sizes of a product")
    @GetMapping("/productsize/{id}")
    public ResponseEntity<Set<ProductSize>> getProductSizesOfAProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getAllProductSizeOfProduct(id));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get all product by restaurant id")
    @GetMapping("/restaurant/{id}")
    public ResponseEntity<List<ProductResponse>> getProductsByRestaurantId(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getAllProductsByRestaurantId(id));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get restaurant by product id")
    @GetMapping("/res/{id}")
    public ResponseEntity<ResResponse> getRestaurantByProductId(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getRestaurantByProductId(id));
    }
}
