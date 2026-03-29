package com.CNTTK18.order_service.dto.client;

import java.time.LocalTime;
import java.util.UUID;

import lombok.Data;

@Data
public class ResClientResponse {
    private UUID id;
    private String resName;
    private boolean enabled;
    private LocalTime openingTime;
    private LocalTime closingTime;
}
