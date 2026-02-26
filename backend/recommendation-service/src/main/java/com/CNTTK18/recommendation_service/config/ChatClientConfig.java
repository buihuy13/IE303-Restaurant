package com.CNTTK18.recommendation_service.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatClientConfig {
    @Bean(name = "merchantChatClient")
    public ChatClient merchantChatClient(ChatClient.Builder builder) {
        return builder.defaultSystem("Bạn là trợ lý cho Chủ quán ăn. "
                        + "Hãy giúp họ tóm tắt lại các đánh giá và bình luận của khách hàng.")
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .build();
    }

    @Bean(name = "userChatClient")
    public ChatClient customerChatClient(ChatClient.Builder builder) {
        return builder.defaultSystem("Bạn là chuyên gia dinh dưỡng tư vấn món ăn cho Khách hàng. "
                        + "Hãy gợi ý món ăn phù hợp với ngữ cảnh của họ.")
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .build();
    }
}
