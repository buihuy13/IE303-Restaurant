package com.CNTTK18.paymentservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankInfoResponse {
    private String bankName;
    private String bankBin;
    private String accountNumber;
    private String accountHolderName;
}
