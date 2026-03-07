package com.CNTTK18.restaurant_service.controller;

import java.util.List;

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

import com.CNTTK18.restaurant_service.dto.response.MessageResponse;
import com.CNTTK18.restaurant_service.dto.size.request.SizeRequest;
import com.CNTTK18.restaurant_service.model.Size;
import com.CNTTK18.restaurant_service.service.SizeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/size")
public class SizeController {
    private SizeService sizeService;

    public SizeController(SizeService sizeService) {
        this.sizeService = sizeService;
    }

    @Tag(name = "Get")
    @Operation(summary = "Get all sizes")
    @GetMapping("")
    public ResponseEntity<List<Size>> getAllSize() {
        return ResponseEntity.ok(sizeService.getAllSize());
    }

    @Tag(name = "Get")
    @Operation(summary = "Get size by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Size> getSizeById(@PathVariable String id) {
        return ResponseEntity.ok(sizeService.getSizeById(id));
    }

    @Tag(name = "Post")
    @Operation(summary = "Create new size")
    @PostMapping("")
    public ResponseEntity<Size> createSize(@RequestBody @Valid SizeRequest sizeRequest) {
        return new ResponseEntity<>(sizeService.createSize(sizeRequest), HttpStatusCode.valueOf(201));
    }

    @Tag(name = "Put")
    @Operation(summary = "Update a size")
    @PutMapping("/{id}")
    public ResponseEntity<Size> updateSize(@RequestBody @Valid SizeRequest sizeRequest, @PathVariable String id) {
        return ResponseEntity.ok(sizeService.updateSize(id, sizeRequest));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete a size")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteSize(@PathVariable String id) {
        sizeService.deleteSize(id);
        return ResponseEntity.ok(new MessageResponse("Delete Successfully"));
    }
}
