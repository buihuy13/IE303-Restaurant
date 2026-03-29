package com.CNTTK18.order_service.dto.cart.response;

import java.time.Instant;
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
public class CartResponse {
    private UUID userId;
    private List<CartRestaurantGroupResponse> restaurants;
    private Instant updatedAt;
}
