package com.CNTTK18.paymentservice.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@Data
@ConfigurationProperties(prefix = "payos")
public class PayOSProperties {
    private String clientId;
    private String apiKey;
    private String checksumKey;
    private String payoutClientId;
    private String payoutApiKey;
    private String payoutChecksumKey;
    private boolean payoutEnabled;
    private boolean payoutDryRun = true;

    public boolean hasPayoutCredentials() {
        return isPresent(payoutClientId) && isPresent(payoutApiKey) && isPresent(payoutChecksumKey);
    }

    private boolean isPresent(String value) {
        return value != null && !value.isBlank();
    }
}
