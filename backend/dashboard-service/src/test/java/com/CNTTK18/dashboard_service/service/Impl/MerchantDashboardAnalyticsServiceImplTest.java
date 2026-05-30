package com.CNTTK18.dashboard_service.service.Impl;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.CNTTK18.dashboard_service.client.OrderDashboardDataClient;
import com.CNTTK18.dashboard_service.dto.order.OrderDataDTO;
import com.CNTTK18.dashboard_service.model.OrderStatus;

@ExtendWith(MockitoExtension.class)
class MerchantDashboardAnalyticsServiceImplTest {
    private static final UUID RESTAURANT_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final String START = "2026-05-01T00:00:00Z";
    private static final String END = "2026-05-30T23:59:59.999999999Z";

    @Mock
    private OrderDashboardDataClient orderDashboardDataClient;

    private MerchantDashboardAnalyticsServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new MerchantDashboardAnalyticsServiceImpl(orderDashboardDataClient);
    }

    @Test
    void getMerchantRevenueForExplicitRangePassesRestaurantAndUtcBounds() {
        when(orderDashboardDataClient.revenueByDayByRestaurant(RESTAURANT_ID, START, END))
                .thenReturn(List.of(revenuePoint("2026-05-01", "50000", 1)));

        service.getMerchantRevenue(RESTAURANT_ID, "month", LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 30), false);

        verify(orderDashboardDataClient).revenueByDayByRestaurant(RESTAURANT_ID, START, END);
    }

    @Test
    void getMerchantOrderStatusForExplicitRangePassesRestaurantAndUtcBounds() {
        service.getMerchantOrderStatus(
                RESTAURANT_ID, "month", LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 30), false);

        verify(orderDashboardDataClient).countByRestaurantCreatedBetween(RESTAURANT_ID, START, END);
        verify(orderDashboardDataClient)
                .countByRestaurantStatusBetween(RESTAURANT_ID, OrderStatus.PENDING, START, END);
        verify(orderDashboardDataClient)
                .countByRestaurantStatusBetween(RESTAURANT_ID, OrderStatus.COMPLETED, START, END);
    }

    @Test
    void getMerchantTopProductsForExplicitRangePassesRestaurantAndUtcBounds() {
        when(orderDashboardDataClient.topProductsByRestaurant(RESTAURANT_ID, START, END, 6))
                .thenReturn(List.of());

        service.getMerchantTopProducts(
                RESTAURANT_ID, "month", 6, LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 30), false);

        verify(orderDashboardDataClient).topProductsByRestaurant(RESTAURANT_ID, START, END, 6);
    }

    private static OrderDataDTO.RevenueByDateItem revenuePoint(String date, String revenue, long orderCount) {
        return OrderDataDTO.RevenueByDateItem.builder()
                .date(date)
                .revenue(new BigDecimal(revenue))
                .orderCount(orderCount)
                .build();
    }
}
