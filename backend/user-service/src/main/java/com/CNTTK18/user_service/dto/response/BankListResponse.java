package com.CNTTK18.user_service.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BankListResponse {
    private String code;
    private String desc;
    private List<BankResponse> data;
}
