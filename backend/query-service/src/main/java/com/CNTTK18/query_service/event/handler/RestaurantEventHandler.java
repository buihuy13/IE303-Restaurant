package com.CNTTK18.query_service.event.handler;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Event.Restaurant.RestaurantCreatedEvent;
import com.CNTTK18.Common.Event.Restaurant.RestaurantDeletedEvent;
import com.CNTTK18.Common.Event.Restaurant.RestaurantUpdatedEvent;
import com.CNTTK18.query_service.model.RestaurantReadModel;
import com.CNTTK18.query_service.repository.RestaurantReadModelRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RestaurantEventHandler {
    private final RestaurantReadModelRepository restaurantRepository;

    @Transactional
    public void handleRestaurantCreated(RestaurantCreatedEvent event) {
        RestaurantReadModel model = RestaurantReadModel.builder()
                .id(event.getId())
                .name(event.getName())
                .slug(event.getSlug())
                .address(event.getAddress())
                .phone(event.getPhone())
                .imageUrl(event.getImageUrl())
                .enabled(event.isEnabled())
                .openingTime(parseStringToLocalTime(event.getOpeningTime()))
                .closingTime(parseStringToLocalTime(event.getClosingTime()))
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .rating(BigDecimal.valueOf(event.getRating()))
                .reviewCount(event.getTotalReview())
                .merchantId(event.getMerchantId())
                .createdAt(event.getCreatedAt())
                .updatedAt(Instant.now())
                .build();
        restaurantRepository.save(model);
    }

    @Transactional
    public void handleRestaurantUpdated(RestaurantUpdatedEvent event) {
        restaurantRepository.findById(event.getId()).ifPresent(model -> {
            model.setName(event.getName());
            model.setSlug(event.getSlug());
            model.setAddress(event.getAddress());
            model.setPhone(event.getPhone());
            model.setImageUrl(event.getImageUrl());
            model.setEnabled(event.isEnabled());
            model.setOpeningTime(parseStringToLocalTime(event.getOpeningTime()));
            model.setClosingTime(parseStringToLocalTime(event.getClosingTime()));
            model.setLatitude(event.getLatitude());
            model.setLongitude(event.getLongitude());
            model.setUpdatedAt(event.getUpdatedAt());
            restaurantRepository.save(model);
        });
    }

    @Transactional
    public void handleRestaurantDeleted(RestaurantDeletedEvent event) {
        restaurantRepository.deleteById(event.getId());
    }

    private LocalTime parseStringToLocalTime(Object time) {
        if (time == null) {
            return null;
        }
        if (time instanceof LocalTime) {
            return (LocalTime) time;
        }
        if (time instanceof String) {
            return LocalTime.parse((String) time);
        }
        return null;
    }
}
