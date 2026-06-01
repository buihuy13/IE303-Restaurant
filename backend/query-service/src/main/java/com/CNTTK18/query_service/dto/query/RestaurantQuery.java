package com.CNTTK18.query_service.dto.query;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantQuery {
    private String rating;
    private String search;
    private Integer nearby;
    private Double lat;
    private Double lon;
    private Boolean enabled;
}
