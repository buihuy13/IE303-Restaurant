package com.CNTTK18.order_service.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "carts")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Cart {
    @Id
    private String id; // This will be the userId as a string

    private UUID userId;

    @Builder.Default
    private List<CartRestaurantGroup> restaurants = new ArrayList<>();

    @LastModifiedDate
    private Instant updatedAt;
}
