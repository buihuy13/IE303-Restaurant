package com.CNTTK18.user_service.mapper;

import org.mapstruct.Mapper;

import com.CNTTK18.user_service.dto.VietqrBankResponse.VietqrBank;
import com.CNTTK18.user_service.dto.response.BankResponse;

@Mapper(componentModel = "spring")
public interface BankMapper {
    BankResponse toBankResponse(VietqrBank vietqrBank);
}
