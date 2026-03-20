package com.CNTTK18.order_service.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartRestaurantGroup {
    private UUID restaurantId;
    private String restaurantName;

    @Builder.Default
    private List<CartItem> items = new ArrayList<>();
}
