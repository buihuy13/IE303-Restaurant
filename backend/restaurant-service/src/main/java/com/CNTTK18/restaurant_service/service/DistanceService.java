package com.CNTTK18.restaurant_service.service;

import java.util.List;

import com.CNTTK18.restaurant_service.dto.distance.response.DistanceResponse;
import com.CNTTK18.restaurant_service.dto.distance.response.OrsDirectionResponse;

public interface DistanceService {
    public DistanceResponse getDistanceAndDurationInList(List<Double> startingPoints, List<List<Double>> endPoints);

    public OrsDirectionResponse getDistanceAndDuration(List<Double> start, List<Double> end);
}
