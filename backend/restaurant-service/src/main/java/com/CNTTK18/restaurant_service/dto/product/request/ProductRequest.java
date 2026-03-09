package com.CNTTK18.restaurant_service.dto.product.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    @Size(max = 100)
    private String productName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private UUID categoryId;

    @NotNull(message = "Product should be available")
    private boolean available;

    @NotNull(message = "Restaurant is required")
    private UUID restaurantId;

    @NotNull(message = "List of sizes is required")
    private List<SizePrice> sizeIds;
}
