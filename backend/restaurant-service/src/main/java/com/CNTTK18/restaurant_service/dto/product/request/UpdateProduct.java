package com.CNTTK18.restaurant_service.dto.product.request;

import java.util.List;

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
public class UpdateProduct {
    @NotBlank(message = "Product name is required")
    @Size(max = 100)
    private String productName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String categoryId;

    @NotNull(message = "List of sizes is required")
    private List<SizePrice> sizeIds;
}
