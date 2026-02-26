package com.CNTTK18.recommendation_service.service.Impl;

import java.util.List;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import com.CNTTK18.recommendation_service.dto.response.MessageResponse;
import com.CNTTK18.recommendation_service.service.RecommendationService;

@Service
public class RecommendationServiceImpl implements RecommendationService {
    private final ChatClient merchantChatClient;
    private final ChatClient userChatClient;

    public RecommendationServiceImpl(
            @Qualifier("merchantChatClient") ChatClient merchantChatClient,
            @Qualifier("userChatClient") ChatClient userChatClient) {
        this.merchantChatClient = merchantChatClient;
        this.userChatClient = userChatClient;
    }

    @Override
    public MessageResponse recommendFood(String userContext) {
        String response = userChatClient.prompt().user(userContext).call().content();
        return new MessageResponse(response);
    }

    @Override
    public List<MessageResponse> generateFoodDescription(String foodName) {
        String text = "Hãy viết 3 đoạn mô tả ngắn hấp dẫn cho món ăn " + foodName + " để thu hút khách hàng.";
        List<MessageResponse> response = merchantChatClient
                .prompt()
                .system(
                        "Bạn là chuyên gia viết mô tả món ăn. Hãy viết mô tả hấp dẫn, ngắn gọn và dễ hiểu để thu hút khách hàng.")
                .options(ChatOptions.builder().temperature(0.9).build())
                .user(text)
                .call()
                .entity(new ParameterizedTypeReference<List<MessageResponse>>() {});

        return response;
    }
}
