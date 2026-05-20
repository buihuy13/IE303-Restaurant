package com.CNTTK18.user_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BankResponse {
    private Integer id;
    private String name;
    private String code;
    private String bin;
    private String shortName;
}
