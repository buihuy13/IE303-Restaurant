package com.CNTTK18.restaurant_service.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.restaurant_service.dto.distance.request.DistanceRequest;
import com.CNTTK18.restaurant_service.dto.distance.response.DistanceResponse;
import com.CNTTK18.restaurant_service.dto.distance.response.OrsDirectionResponse;

import reactor.core.publisher.Mono;

@Service
public class DistanceService {
    @Value("${OPENROUTESERVICE_API_KEY}")
    private String apiKey;

    @Value("${OPENROUTESERVICE_LIST_URL}")
    private String apiListUrl;

    @Value("${OPENROUTESERVICE_URL}")
    private String apiUrl;

    final int R = 6371000;

    private WebClient webClientBuilder;

    public DistanceService(WebClient webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public Mono<DistanceResponse> getDistanceAndDurationInList(
            List<Double> startingPoints, List<List<Double>> endPoints) {
        List<List<Double>> allPoints = new ArrayList<>();

        allPoints.add(startingPoints);
        allPoints.addAll(endPoints);

        DistanceRequest distanceRequest = new DistanceRequest(allPoints);

        return webClientBuilder
                .post()
                .uri(apiListUrl) // Endpoint của ORS Matrix API
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", apiKey) // ORS yêu cầu API Key trong header
                .bodyValue(distanceRequest)
                .retrieve()
                .bodyToMono(DistanceResponse.class);
    }

    public Mono<OrsDirectionResponse> getDistanceAndDuration(List<Double> start, List<Double> end) {
        Map<String, List<List<Double>>> requestBody = Map.of("coordinates", List.of(start, end));

        return webClientBuilder
                .post()
                .uri(apiUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("Authorization", apiKey) // ORS yêu cầu API Key trong header
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(OrsDirectionResponse.class);
    }

    public Double calculateHaversineDistance(Double lon1, Double lat1, Double lon2, Double lat2) {
        Double latDistance = toRad(lat2 - lat1);
        Double lonDistance = toRad(lon2 - lon1);
        Double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        Double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public Double toRad(Double value) {
        return value * Math.PI / 180;
    }
}
