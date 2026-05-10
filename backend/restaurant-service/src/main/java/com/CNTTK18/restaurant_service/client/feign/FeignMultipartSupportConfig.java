package com.CNTTK18.restaurant_service.client.feign;

import org.springframework.context.annotation.Bean;

import feign.codec.Encoder;
import feign.form.spring.SpringFormEncoder;

public class FeignMultipartSupportConfig {

    @Bean
    public Encoder feignFormEncoder() {
        return new SpringFormEncoder();
    }
}
