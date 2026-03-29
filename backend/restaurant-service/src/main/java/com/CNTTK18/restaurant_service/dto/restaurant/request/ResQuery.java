package com.CNTTK18.restaurant_service.dto.restaurant.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResQuery {
    private Double lat;
    private Double lon;
    private String search;
    private Integer nearby;
    private String rating;
    private String category;
    private Boolean enabled;
}
