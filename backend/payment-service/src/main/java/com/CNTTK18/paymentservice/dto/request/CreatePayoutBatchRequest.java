package com.CNTTK18.paymentservice.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;

import lombok.Data;

@Data
public class CreatePayoutBatchRequest {
    @NotEmpty
    private List<UUID> payoutRequestIds;
}
