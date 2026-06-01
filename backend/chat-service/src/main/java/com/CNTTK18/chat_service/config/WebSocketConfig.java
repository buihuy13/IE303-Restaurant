package com.CNTTK18.chat_service.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final WebsocketHandshakeInterceptor handshakeInterceptor;
    private TaskScheduler messageBrokerTaskScheduler;

    public WebSocketConfig(WebsocketHandshakeInterceptor handshakeInterceptor) {
        this.handshakeInterceptor = handshakeInterceptor;
    }

    @Autowired
    public void setMessageBrokerTaskScheduler(@Lazy TaskScheduler taskScheduler) {
        this.messageBrokerTaskScheduler = taskScheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for topics (in-memory broker)
        // server gửi message đến client có tiền tố /topic
        config.enableSimpleBroker("/topic")
                .setHeartbeatValue(new long[] {20000, 30000})
                .setTaskScheduler(this.messageBrokerTaskScheduler);

        // Set prefix for client messages (server nhận message từ client)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // endpoint tại /ws, client sẽ kết nối tới đây
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").addInterceptors(handshakeInterceptor);
    }
}
