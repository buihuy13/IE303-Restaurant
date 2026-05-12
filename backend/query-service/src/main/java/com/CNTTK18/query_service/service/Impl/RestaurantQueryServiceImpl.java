package com.CNTTK18.query_service.service.Impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.CNTTK18.query_service.dto.distance.response.OrsDirectionResponse;
import com.CNTTK18.query_service.dto.query.RestaurantQuery;
import com.CNTTK18.query_service.dto.request.Coordinates;
import com.CNTTK18.query_service.dto.response.RestaurantWithDistanceResponse;
import com.CNTTK18.query_service.exception.DistanceDurationException;
import com.CNTTK18.query_service.mapper.RestaurantMapper;
import com.CNTTK18.query_service.model.RestaurantReadModel;
import com.CNTTK18.query_service.repository.RestaurantReadModelRepository;
import com.CNTTK18.query_service.service.DistanceService;
import com.CNTTK18.query_service.service.RestaurantQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RestaurantQueryServiceImpl implements RestaurantQueryService {

    private final RestaurantReadModelRepository repository;
    private final DistanceService distanceService;
    private final RestaurantMapper mapper;

    @Override
    public RestaurantWithDistanceResponse getRestaurantById(UUID id, Coordinates location) {
        RestaurantReadModel restaurant =
                repository.findById(id).orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (location == null) {
            return mapper.toRestaurantResponse(restaurant, null, null);
        }

        List<Double> start = List.of(location.getLongitude(), location.getLatitude());
        List<Double> end = List.of(restaurant.getLongitude(), restaurant.getLatitude());

        OrsDirectionResponse response = distanceService.getDistanceAndDuration(start, end);

        if (response == null || response.getFeatures().isEmpty()) {
            throw new DistanceDurationException("Error while calculating distance and duration");
        }
 
        double distance =
                response.getFeatures().get(0).getProperties().getSummary().getDistance();
        double duration =
                response.getFeatures().get(0).getProperties().getSummary().getDuration();

        return mapper.toRestaurantResponse(restaurant, distance, duration);
    }

    @Override
    public Page<RestaurantWithDistanceResponse> getNearbyRestaurants(RestaurantQuery query, Pageable pageable) {
        int nearby = query.getNearby() == null || query.getNearby() > 20000 ? 20000 : query.getNearby();
        String sort = query.getRating() != null && "desc".equalsIgnoreCase(query.getRating())
                ? "rating_id_desc"
                : "id_asc";

        String search = (query.getSearch() != null && !query.getSearch().isBlank()) ? query.getSearch() : null;

        Page<RestaurantReadModel> restaurantsPage = repository.findRestaurantsWithinDistance(
            query.getLon(),
            query.getLat(),
            nearby,
            search,
            query.getEnabled(),
            sort,
            pageable);

        if (restaurantsPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<RestaurantReadModel> restaurants = restaurantsPage.getContent();

        List<Double> startingPoints = List.of(query.getLon(), query.getLat());
        List<List<Double>> endPoints = restaurants.stream()
                .map(r -> List.of(r.getLongitude(), r.getLatitude()))
                .toList();

        var response = distanceService.getDistanceAndDurationInList(startingPoints, endPoints);

        List<Double> durations = response.getDurations().get(0);
        List<Double> distances = response.getDistances().get(0);

        List<RestaurantWithDistanceResponse> responseList = IntStream.range(0, restaurants.size())
                .mapToObj(i -> {
                    RestaurantReadModel restaurant = restaurants.get(i);
                    return mapper.toRestaurantResponse(restaurant, distances.get(i), durations.get(i));
                })
                .toList();

        return new PageImpl<>(responseList, pageable, restaurantsPage.getTotalElements());
    }
}
