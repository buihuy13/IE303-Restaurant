package com.CNTTK18.recommendation_service.service.Impl;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.recommendation_service.dto.request.MoodFoodRecommendationRequest;
import com.CNTTK18.recommendation_service.dto.request.ReviewRequest;
import com.CNTTK18.recommendation_service.dto.response.MessageResponse;
import com.CNTTK18.recommendation_service.dto.response.ReviewListResponse;
import com.CNTTK18.recommendation_service.dto.response.ReviewSummarizeResponse;
import com.CNTTK18.recommendation_service.service.RecommendationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class RecommendationServiceImpl implements RecommendationService {
    private final ChatClient merchantChatClient;
    private final ChatClient userChatClient;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    public RecommendationServiceImpl(
            @Qualifier("merchantChatClient") ChatClient merchantChatClient,
            @Qualifier("userChatClient") ChatClient userChatClient,
            WebClient.Builder webclientBuilder) {
        this.merchantChatClient = merchantChatClient;
        this.userChatClient = userChatClient;
        this.webClientBuilder = webclientBuilder;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public MessageResponse recommendFood(String userContext) {
        String response = userChatClient.prompt().user(userContext).call().content();
        return new MessageResponse(response);
    }

    @Override
    public MessageResponse recommendFoodByMood(MoodFoodRecommendationRequest request) {

        Map<String, Object> productPage = webClientBuilder
                .build()
                .get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .path("lb://restaurant-service/api/products")
                            .queryParam("lat", request.getLat())
                            .queryParam("lon", request.getLon())
                            .queryParam("page", 0)
                            .queryParam("size", 60);

                    return builder.build();
                })
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (productPage == null
                || !(productPage.get("content") instanceof List<?> rawContent)
                || rawContent.isEmpty()) {
            return new MessageResponse("Không có món phù hợp với bộ lọc hiện tại để gợi ý theo mood.");
        }

        List<Map<String, Object>> candidates = normalizeCandidates(rawContent).stream()
                .sorted(Comparator.comparing(
                                (Map<String, Object> item) -> ((Number) item.get("duration")).doubleValue())
                        .thenComparing(item -> ((Number) item.get("distance")).doubleValue())
                        .thenComparing(item -> -((Number) item.get("rating")).doubleValue()))
                .limit(60)
                .toList();

        if (candidates.isEmpty()) {
            return new MessageResponse("Không có món phù hợp với bộ lọc hiện tại để gợi ý theo mood.");
        }

        String aiInputContext = buildAiContext(request, candidates);

        String prompt = "Dựa trên mood và danh sách món đã lọc sẵn, hãy gợi ý món ăn tốt nhất.\n"
                + "Bắt buộc: chỉ chọn từ danh sách candidates được cung cấp, không tự tạo món mới.\n"
                + "Trả về JSON với cấu trúc: "
                + "{\"recommendations\":[{\"productId\":\"...\",\"productName\":\"...\",\"score\":0-100,\"reason\":\"...\"}],\"summary\":\"...\"}.\n"
                + "Sắp xếp giảm dần theo mức độ phù hợp mood.\n\n"
                + aiInputContext;

        String response = userChatClient
                .prompt()
                .options(ChatOptions.builder().temperature(0.6).build())
                .user(prompt)
                .call()
                .content();

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

    private List<Map<String, Object>> normalizeCandidates(List<?> rawContent) {
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object item : rawContent) {
            if (!(item instanceof Map<?, ?> rawMap)) {
                continue;
            }

            String productId = asText(rawMap.get("id"));
            String productName = asText(rawMap.get("productName"));
            String categoryName = asText(rawMap.get("categoryName"));
            boolean available = asBoolean(rawMap.get("available"));
            double rating = asDouble(rawMap.get("rating"), 0D);
            double distance = asDouble(rawMap.get("distance"), Double.MAX_VALUE);
            double duration = asDouble(rawMap.get("duration"), Double.MAX_VALUE);

            if (!available || productId == null || productName == null) {
                continue;
            }

            Map<String, Object> normalized = new LinkedHashMap<>();
            normalized.put("productId", productId);
            normalized.put("productName", productName);
            normalized.put("category", categoryName);
            normalized.put("rating", rating);
            normalized.put("distance", distance);
            normalized.put("duration", duration);
            result.add(normalized);
        }

        return result;
    }

    private String buildAiContext(MoodFoodRecommendationRequest request, List<Map<String, Object>> candidates) {
        Map<String, Object> context = new LinkedHashMap<>();
        context.put("mood", request.getMood());
        context.put("location", Map.of("lat", request.getLat(), "lon", request.getLon()));
        context.put("candidateCount", candidates.size());
        context.put("candidates", candidates);

        try {
            return objectMapper.writeValueAsString(context);
        } catch (JsonProcessingException e) {
            return context.toString();
        }
    }

    private String asText(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value);
        return text.isBlank() ? null : text;
    }

    private boolean asBoolean(Object value) {
        if (value instanceof Boolean boolValue) {
            return boolValue;
        }
        if (value == null) {
            return false;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private double asDouble(Object value, double defaultValue) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value == null) {
            return defaultValue;
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
