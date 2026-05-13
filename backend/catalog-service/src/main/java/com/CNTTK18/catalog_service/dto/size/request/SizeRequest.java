package com.CNTTK18.catalog_service.dto.size.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SizeRequest {
    @NotBlank(message = "Size name is required")
    @Size(max = 50)
    private String name;
}
