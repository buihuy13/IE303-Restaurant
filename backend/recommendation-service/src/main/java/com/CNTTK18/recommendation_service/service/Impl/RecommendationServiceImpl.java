package com.CNTTK18.recommendation_service.service.Impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.recommendation_service.dto.request.ReviewRequest;
import com.CNTTK18.recommendation_service.dto.response.MessageResponse;
import com.CNTTK18.recommendation_service.dto.response.ReviewListResponse;
import com.CNTTK18.recommendation_service.dto.response.ReviewSummarizeResponse;
import com.CNTTK18.recommendation_service.service.RecommendationService;

@Service
public class RecommendationServiceImpl implements RecommendationService {
    private final ChatClient merchantChatClient;
    private final ChatClient userChatClient;
    private final WebClient.Builder webClientBuilder;

    public RecommendationServiceImpl(
            @Qualifier("merchantChatClient") ChatClient merchantChatClient,
            @Qualifier("userChatClient") ChatClient userChatClient,
            WebClient.Builder webclientBuilder) {
        this.merchantChatClient = merchantChatClient;
        this.userChatClient = userChatClient;
        this.webClientBuilder = webclientBuilder;
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
                .options(ChatOptions.builder().temperature(0.7).build())
                .user(text)
                .call()
                .entity(new ParameterizedTypeReference<List<MessageResponse>>() {});

        return response;
    }

    @Override
    public ReviewSummarizeResponse summarizeReviews(ReviewRequest reviewRequest) {
        String rvType = reviewRequest.getRvType().toString().toLowerCase();
        UUID id = reviewRequest.getId();
        ReviewListResponse reviewList = webClientBuilder
                .build()
                .get()
                .uri("lb://restaurant-service/api/review/{rvType}/{id}", rvType, id)
                .retrieve()
                .bodyToMono(ReviewListResponse.class)
                .block();

        List<String> reviewResponses = reviewList.getResponse();
        if (reviewResponses == null || reviewResponses.size() <= 3) {
            return new ReviewSummarizeResponse(
                    "Không đủ đánh giá để tóm tắt. Vui lòng cung cấp ít nhất 4 đánh giá.", null);
        }

        String reviewsText = reviewResponses.stream()
                .map(r -> String.format("Review: %s", r))
                .collect(Collectors.joining("\n"));

        String prompt = String.format(
                "Hãy tóm tắt danh sách các đánh giá (reviews) sau đây:\n\n%s\n\n"
                        + "Xác định điểm mạnh, điểm yếu, tóm tắt chung và cải thiện. "
                        + "Trả về JSON format.",
                reviewsText);

        ReviewSummarizeResponse response = merchantChatClient
                .prompt()
                .system(
                        "Bạn là chuyên gia tổng hợp các bình luận, đánh giá từ khách hàng để đưa ra điểm mạnh và điểm yếu.")
                .options(ChatOptions.builder().temperature(0.5).build())
                .user(prompt)
                .call()
                .entity(new ParameterizedTypeReference<ReviewSummarizeResponse>() {});

        return response;
    }
}
