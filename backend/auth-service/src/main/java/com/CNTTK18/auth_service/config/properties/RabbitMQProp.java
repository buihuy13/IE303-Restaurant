package com.CNTTK18.auth_service.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@Data
@ConfigurationProperties(prefix = "spring.rabbitmq")
public class RabbitMQProp {
    private String host;
    private int port;
    private String username;
    private String password;
}
