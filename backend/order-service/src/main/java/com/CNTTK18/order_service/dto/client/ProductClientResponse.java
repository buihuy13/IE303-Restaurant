package com.CNTTK18.order_service.dto.client;

import java.util.UUID;

import lombok.Data;

@Data
public class ProductClientResponse {
    private UUID id;
    private String productName; // matches JSON key from restaurant-service
    private String imageURL; // matches JSON key from restaurant-service (note: uppercase URL)
}
