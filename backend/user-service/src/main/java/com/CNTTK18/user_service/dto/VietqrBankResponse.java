package com.CNTTK18.user_service.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VietqrBankResponse {
    private String code;
    private String desc;

    @JsonProperty("data")
    private List<VietqrBank> banks;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VietqrBank {
        private Integer id;
        private String name;
        private String code;
        private String bin;

        @JsonProperty("shortName")
        private String shortName;

        private String logo;

        @JsonProperty("transferSupported")
        private Integer transferSupported;

        @JsonProperty("lookupSupported")
        private Integer lookupSupported;

        @JsonProperty("short_name")
        private String shortNameAlt;

        private Integer support;

        @JsonProperty("isTransfer")
        private Integer isTransfer;

        @JsonProperty("swift_code")
        private String swiftCode;
    }
}
