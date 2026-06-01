package com.CNTTK18.query_service.service.Impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.query_service.config.properties.DistanceProperties;
import com.CNTTK18.query_service.dto.distance.request.DistanceRequest;
import com.CNTTK18.query_service.dto.distance.response.DistanceResponse;
import com.CNTTK18.query_service.dto.distance.response.OrsDirectionResponse;
import com.CNTTK18.query_service.service.DistanceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DistanceServiceImpl implements DistanceService {
    private final DistanceProperties distanceProperties;
    private final WebClient webClientBuilder;

    @Override
    public DistanceResponse getDistanceAndDurationInList(List<Double> startingPoints, List<List<Double>> endPoints) {
        List<List<Double>> allPoints = new ArrayList<>();

        allPoints.add(startingPoints);
        allPoints.addAll(endPoints);

        DistanceRequest distanceRequest = new DistanceRequest(allPoints);

        return webClientBuilder
                .post()
                .uri(distanceProperties.getListUrl())
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", distanceProperties.getApiKey())
                .bodyValue(distanceRequest)
                .retrieve()
                .bodyToMono(DistanceResponse.class)
                .block();
    }

    @Override
    public OrsDirectionResponse getDistanceAndDuration(List<Double> start, List<Double> end) {
        Map<String, List<List<Double>>> requestBody = Map.of("coordinates", List.of(start, end));

        return webClientBuilder
                .post()
                .uri(distanceProperties.getUrl())
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", distanceProperties.getApiKey())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(OrsDirectionResponse.class)
                .block();
    }
}
