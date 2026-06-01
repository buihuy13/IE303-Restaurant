package com.CNTTK18.user_service.service;

import java.util.UUID;

import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.request.BankDetailsRequest;
import com.CNTTK18.user_service.dto.response.BankListResponse;
import com.CNTTK18.user_service.dto.response.UserResponse;

public interface BankService {
    BankListResponse getVietnameseBanks();

    String getBankNameByCode(String bankCode);

    boolean validateBankCode(String bankCode);

    UserResponse updateMerchantBankDetails(UUID userId, BankDetailsRequest request, UserRole authUser);
}
