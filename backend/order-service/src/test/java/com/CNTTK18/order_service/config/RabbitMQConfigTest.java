package com.CNTTK18.order_service.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import java.util.Arrays;

import org.junit.jupiter.api.Test;

class RabbitMQConfigTest {

    @Test
    void producerDoesNotDeclareConsumerOwnedOrderNotificationQueue() {
        assertThat(Arrays.stream(RabbitMQConfig.class.getDeclaredMethods()).map(Method::getName))
                .contains("orderNotificationExchange")
                .doesNotContain("orderNotificationQueue", "orderNotificationBinding");
    }
}
