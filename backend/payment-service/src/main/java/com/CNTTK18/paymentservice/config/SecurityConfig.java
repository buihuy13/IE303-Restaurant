package com.CNTTK18.paymentservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable()) // Tắt CSRF bảo vệ chống giả mạo
                .cors(cors -> cors.disable()) // Tắt luôn CORS config mặc định (sẽ do Gateway lo)
                .addFilterBefore(new InternalFilter(), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(request -> request
                        // Cho phép tất cả các đường truyền đi xuyên qua tường lửa này
                        // Mở cửa đặc biệt là cho cổng Webhook của PayOS có thể gọi POST vào API của mình
                        .anyRequest()
                        .permitAll())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }
}
