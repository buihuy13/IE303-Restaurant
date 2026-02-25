package com.CNTTK18.user_service.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddressResponse {
    private UUID id;
    private String location;
    private double longitude;
    private double latitude;
}
