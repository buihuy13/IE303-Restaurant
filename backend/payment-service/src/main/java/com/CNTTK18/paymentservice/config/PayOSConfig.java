package com.CNTTK18.paymentservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.CNTTK18.paymentservice.config.properties.PayOSProperties;

import lombok.RequiredArgsConstructor;
import vn.payos.PayOS;

@Configuration
@RequiredArgsConstructor
public class PayOSConfig {

    private final PayOSProperties payOSProperties;

    @Bean
    public PayOS payOS() {
        // Khởi tạo đối tượng PayOS dùng chung cho toàn bộ ứng dụng
        return new PayOS(payOSProperties.getClientId(), payOSProperties.getApiKey(), payOSProperties.getChecksumKey());
    }
}
