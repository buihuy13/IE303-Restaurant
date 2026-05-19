package com.CNTTK18.paymentservice.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPayoutRequestsResponse {
    private List<PayoutRequestResponse> requests;
    private PaginationResponse pagination;
}
