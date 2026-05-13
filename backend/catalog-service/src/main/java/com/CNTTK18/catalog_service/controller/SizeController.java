package com.CNTTK18.catalog_service.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.catalog_service.dto.response.MessageResponse;
import com.CNTTK18.catalog_service.dto.size.request.SizeRequest;
import com.CNTTK18.catalog_service.dto.size.response.SizeResponse;
import com.CNTTK18.catalog_service.service.SizeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/catalog/size")
@RequiredArgsConstructor
public class SizeController {

    private final SizeService sizeService;

    @Tag(name = "Get")
    @Operation(summary = "Get all sizes")
    @GetMapping("")
    public ResponseEntity<List<SizeResponse>> getAllSizes() {
        return ResponseEntity.ok(sizeService.getAllSizes());
    }

    @Tag(name = "Get")
    @Operation(summary = "Get all sizes (cached endpoint)")
    @GetMapping("/all")
    public ResponseEntity<List<SizeResponse>> getAllSizesCached() {
        return ResponseEntity.ok(sizeService.getAllSizes());
    }

    @Tag(name = "Get")
    @Operation(summary = "Get size by ID")
    @GetMapping("/{id}")
    public ResponseEntity<SizeResponse> getSizeById(@PathVariable UUID id) {
        return ResponseEntity.ok(sizeService.getSizeById(id));
    }

    @Tag(name = "Post")
    @Operation(summary = "Create new size")
    @PostMapping("")
    public ResponseEntity<SizeResponse> createSize(@RequestBody @Valid SizeRequest sizeRequest) {
        return new ResponseEntity<>(sizeService.createSize(sizeRequest), HttpStatusCode.valueOf(201));
    }

    @Tag(name = "Put")
    @Operation(summary = "Update a size")
    @PutMapping("/{id}")
    public ResponseEntity<SizeResponse> updateSize(@PathVariable UUID id, @RequestBody @Valid SizeRequest sizeRequest) {
        return ResponseEntity.ok(sizeService.updateSize(id, sizeRequest));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete a size")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteSize(@PathVariable UUID id) {
        sizeService.deleteSize(id);
        return ResponseEntity.ok(new MessageResponse("Delete Successfully"));
    }
}
