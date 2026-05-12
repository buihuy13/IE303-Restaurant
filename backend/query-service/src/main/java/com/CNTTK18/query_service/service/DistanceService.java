package com.CNTTK18.query_service.service;

import java.util.List;

import com.CNTTK18.query_service.dto.distance.response.DistanceResponse;
import com.CNTTK18.query_service.dto.distance.response.OrsDirectionResponse;

public interface DistanceService {
    DistanceResponse getDistanceAndDurationInList(List<Double> startingPoints, List<List<Double>> endPoints);

    OrsDirectionResponse getDistanceAndDuration(List<Double> start, List<Double> end);
}
