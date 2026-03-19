package com.CNTTK18.order_service.dto.client;

import java.util.UUID;
import lombok.Data;

@Data
public class ProductClientResponse {
    private UUID id;
    private String name;
    private String imageUrl;
    private UUID restaurantId;
    // We might need restaurant name, or fetch it separately
}
