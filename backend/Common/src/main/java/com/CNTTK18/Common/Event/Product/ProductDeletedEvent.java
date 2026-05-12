package com.CNTTK18.Common.Event.Product;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDeletedEvent {
    private UUID id;
    private UUID restaurantId;
    private Instant deletedAt;
}
