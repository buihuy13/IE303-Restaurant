package com.CNTTK18.restaurant_service.dto.cate.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CateResponse {
    private String cateId;
    private String cateName;
}
