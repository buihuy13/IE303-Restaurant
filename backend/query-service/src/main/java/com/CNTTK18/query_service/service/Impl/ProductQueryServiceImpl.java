package com.CNTTK18.query_service.service.Impl;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.CNTTK18.query_service.dto.query.ProductQuery;
import com.CNTTK18.query_service.dto.response.ProductWithDistanceResponse;
import com.CNTTK18.query_service.mapper.ProductMapper;
import com.CNTTK18.query_service.model.ProductReadModel;
import com.CNTTK18.query_service.repository.ProductReadModelRepository;
import com.CNTTK18.query_service.service.DistanceService;
import com.CNTTK18.query_service.service.ProductQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductQueryServiceImpl implements ProductQueryService {

    private final ProductReadModelRepository repository;
    private final DistanceService distanceService;
    private final ProductMapper mapper;

    @Override
    public Page<ProductWithDistanceResponse> getNearbyProducts(ProductQuery query, Pageable pageable) {
        Integer nearby = query.getNearby() == null || query.getNearby() > 20000 ? 20000 : query.getNearby();

        String categoryName =
                (query.getCategory() != null && !query.getCategory().isBlank()) ? query.getCategory() : null;

        String normalizedSearch =
                (query.getSearch() != null && !query.getSearch().isBlank()) ? query.getSearch() : null;

        String sort =
                query.getRating() != null && "desc".equalsIgnoreCase(query.getRating()) ? "rating_id_desc" : "id_asc";

        Page<ProductReadModel> products = repository.findProductsWithinDistance(
                query.getLon(),
                query.getLat(),
                nearby,
                normalizedSearch,
                categoryName,
                query.getMaxPrice() != null ? query.getMaxPrice() : null,
                query.getMinPrice() != null ? query.getMinPrice() : null,
                sort,
                pageable);

        if (products.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Double> startingPoints = List.of(query.getLon(), query.getLat());
        List<ProductReadModel> productList = products.getContent();
        List<List<Double>> endPoints = productList.stream()
                .map(p -> List.of(p.getRestaurantLongitude(), p.getRestaurantLatitude()))
                .toList();

        var response = distanceService.getDistanceAndDurationInList(startingPoints, endPoints);

        List<Double> durations = response.getDurations().get(0);
        List<Double> distances = response.getDistances().get(0);

        List<ProductWithDistanceResponse> responseList = IntStream.range(0, productList.size())
                .mapToObj(i -> {
                    ProductReadModel product = productList.get(i);
                    return mapper.toProductResponse(product, distances.get(i), durations.get(i));
                })
                .toList();

        return sortProducts(responseList, query.getRating(), query.getLocationsorted(), pageable);
    }

    private Page<ProductWithDistanceResponse> sortProducts(
            List<ProductWithDistanceResponse> products, String rating, String locationsorted, Pageable pageable) {
        List<ProductWithDistanceResponse> sorted = new ArrayList<>(products);

        if ("desc".equalsIgnoreCase(rating)) {
            sorted.sort(Comparator.comparing(
                    ProductWithDistanceResponse::getRating, Comparator.nullsLast(Comparator.reverseOrder())));
        } else if ("asc".equals(locationsorted)) {
            sorted.sort(Comparator.comparing(p -> p.getDistance()));
        }

        return new PageImpl<>(sorted, pageable, sorted.size());
    }
}
