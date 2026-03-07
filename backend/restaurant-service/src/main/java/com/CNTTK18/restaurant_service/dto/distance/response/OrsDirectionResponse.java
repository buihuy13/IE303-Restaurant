package com.CNTTK18.restaurant_service.dto.distance.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrsDirectionResponse {
    @JsonProperty("features")
    private List<Feature> features;
}
