package com.CNTTK18.restaurant_service.dto.distance.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Properties {
    @JsonProperty("summary")
    private Summary summary;
}
