package com.CNTTK18.api_gateway.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;

import org.junit.jupiter.api.Test;

class SecurityConfigTest {
    @Test
    void payOsWebhookAliasIsPublic() throws Exception {
        Field publicPaths = SecurityConfig.class.getDeclaredField("PUBLIC_PATHS");
        publicPaths.setAccessible(true);

        assertThat((String[]) publicPaths.get(null)).contains("/payment/payos-webhook");
    }
}
