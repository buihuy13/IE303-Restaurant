package com.CNTTK18.product_service.client.feign;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import feign.codec.Encoder;
import feign.form.spring.SpringFormEncoder;

@Configuration
public class FeignMultipartSupportConfig {

    @Bean
    public Encoder feignEncoder() {
        return new SpringFormEncoder();
    }
}
