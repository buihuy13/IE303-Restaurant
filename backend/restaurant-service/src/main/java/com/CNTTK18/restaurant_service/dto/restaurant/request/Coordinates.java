package com.CNTTK18.restaurant_service.dto.restaurant.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Coordinates {
    private double longitude;
    private double latitude;
}
