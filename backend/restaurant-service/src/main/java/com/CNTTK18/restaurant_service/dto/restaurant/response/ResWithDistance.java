package com.CNTTK18.restaurant_service.dto.restaurant.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResWithDistance {
    private UUID id;
    private Double distance;
    private Double duration;
}
