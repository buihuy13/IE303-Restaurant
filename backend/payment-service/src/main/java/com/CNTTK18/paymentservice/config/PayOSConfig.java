package com.CNTTK18.paymentservice.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.CNTTK18.paymentservice.config.properties.PayOSProperties;

import lombok.RequiredArgsConstructor;
import vn.payos.PayOS;

@Configuration
@RequiredArgsConstructor
public class PayOSConfig {

    private final PayOSProperties payOSProperties;

    @Bean
    @Primary
    public PayOS payOS() {
        // Khởi tạo đối tượng PayOS dùng chung cho toàn bộ ứng dụng
        return new PayOS(payOSProperties.getClientId(), payOSProperties.getApiKey(), payOSProperties.getChecksumKey());
    }

    @Bean
    @Qualifier("payOSPayout")
    public PayOS payOSPayout() {
        if (!payOSProperties.hasPayoutCredentials()) {
            return new PayOS("disabled", "disabled", "disabled");
        }
        return new PayOS(
                payOSProperties.getPayoutClientId(),
                payOSProperties.getPayoutApiKey(),
                payOSProperties.getPayoutChecksumKey());
    }
}
