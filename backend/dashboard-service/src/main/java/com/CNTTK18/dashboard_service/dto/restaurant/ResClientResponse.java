package com.CNTTK18.dashboard_service.dto.restaurant;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResClientResponse {
    private UUID id;
}
