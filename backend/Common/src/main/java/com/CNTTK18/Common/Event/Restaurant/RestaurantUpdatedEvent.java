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
public class RestaurantUpdatedEvent {
    private UUID id;
    private String name;
    private String slug;
    private String address;
    private String phone;
    private String imageUrl;
    private boolean enabled;
    private String openingTime;
    private String closingTime;
    private Double latitude;
    private Double longitude;
    private Instant updatedAt;
}
