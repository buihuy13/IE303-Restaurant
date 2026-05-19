package com.CNTTK18.user_service.service.Impl;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.VietqrBankResponse;
import com.CNTTK18.user_service.dto.request.BankDetailsRequest;
import com.CNTTK18.user_service.dto.response.BankListResponse;
import com.CNTTK18.user_service.dto.response.BankResponse;
import com.CNTTK18.user_service.dto.response.UserResponse;
import com.CNTTK18.user_service.exception.ForbiddenException;
import com.CNTTK18.user_service.mapper.BankMapper;
import com.CNTTK18.user_service.mapper.UserMapper;
import com.CNTTK18.user_service.model.Users;
import com.CNTTK18.user_service.repository.UserRepository;
import com.CNTTK18.user_service.service.BankService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BankServiceImpl implements BankService {

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final BankMapper bankMapper;

    @Value("${vietqr.api.url:https://api.vietqr.io/v2/banks}")
    private String vietqrApiUrl;

    @Override
    @Cacheable(value = "vietqr_banks_list", key = "'all'")
    public BankListResponse getVietnameseBanks() {
        log.info("Fetching Vietnamese banks from VietQR API");
        try {
            VietqrBankResponse response = restTemplate.getForObject(vietqrApiUrl, VietqrBankResponse.class);
            if (response != null && "00".equals(response.getCode())) {
                List<BankResponse> banks = response.getBanks().stream()
                        .map(bankMapper::toBankResponse)
                        .toList();
                return new BankListResponse(response.getCode(), response.getDesc(), banks);
            }
            return new BankListResponse("99", "Failed to fetch banks", List.of());
        } catch (Exception e) {
            log.error("Error fetching banks from VietQR API", e);
            return new BankListResponse("99", "Error fetching banks: " + e.getMessage(), List.of());
        }
    }

    @Override
    public String getBankNameByCode(String bankCode) {
        BankListResponse bankList = getVietnameseBanks();
        return bankList.getData().stream()
                .filter(bank -> bank.getCode().equalsIgnoreCase(bankCode))
                .findFirst()
                .map(BankResponse::getName)
                .orElse(null);
    }

    @Override
    public boolean validateBankCode(String bankCode) {
        return getBankNameByCode(bankCode) != null;
    }

    @Override
    @Transactional
    public UserResponse updateMerchantBankDetails(UUID userId, BankDetailsRequest request, UserRole authUser) {
        checkAuthority(userId, authUser);

        Users user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!isMerchant(userId, authUser)) {
            throw new ForbiddenException("Only merchants can have bank details");
        }

        if (!validateBankCode(request.getBank())) {
            throw new IllegalArgumentException("Bank code '" + request.getBank() + "' is not a valid Vietnamese bank");
        }

        String bankName = getBankNameByCode(request.getBank());
        user.setBankNumber(request.getBankNumber());
        user.setBank(request.getBank());
        user.setBankName(bankName);

        user = userRepository.save(user);
        log.info("Updated bank details for user {} with bank {}", userId, request.getBank());

        return userMapper.toUserResponse(user);
    }

    private void checkAuthority(UUID id, UserRole authUser) {
        if (authUser != null && !authUser.getUserId().equals(id) && !"ADMIN".equals(authUser.getRole())) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }

    private boolean isMerchant(UUID userId, UserRole authUser) {
        return "MERCHANT".equals(authUser.getRole()) || "ADMIN".equals(authUser.getRole());
    }
}
