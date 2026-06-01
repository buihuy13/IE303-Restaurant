package com.CNTTK18.Common.Event.Restaurant;

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
public class RestaurantDeletedEvent {
    private UUID id;
    private UUID merchantId;
    private Instant deletedAt;
}
