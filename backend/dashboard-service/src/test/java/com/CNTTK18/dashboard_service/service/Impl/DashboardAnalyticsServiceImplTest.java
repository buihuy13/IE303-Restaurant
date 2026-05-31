package com.CNTTK18.dashboard_service.service.Impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.CNTTK18.dashboard_service.client.OrderDashboardDataClient;
import com.CNTTK18.dashboard_service.dto.order.OrderDataDTO;
import com.CNTTK18.dashboard_service.model.OrderStatus;

@ExtendWith(MockitoExtension.class)
class DashboardAnalyticsServiceImplTest {
    private static final String START = "2026-05-01T00:00:00Z";
    private static final String END = "2026-05-30T23:59:59.999999999Z";

    @Mock
    private OrderDashboardDataClient orderDashboardDataClient;

    private DashboardAnalyticsServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new DashboardAnalyticsServiceImpl(orderDashboardDataClient);
    }

    @Test
    void getRevenueForExplicitRangeCallsOrderClientWithUtcBounds() {
        when(orderDashboardDataClient.revenueByDay(START, END))
                .thenReturn(List.of(revenuePoint("2026-05-01", "120000", 2)));

        var result = service.getRevenue("month", LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 30), false);

        assertThat(result.getTotalRevenue()).isEqualByComparingTo("120000");
        assertThat(result.getTotalOrders()).isEqualTo(2);
        verify(orderDashboardDataClient).revenueByDay(START, END);
    }

    @Test
    void getOrderStatusForExplicitRangeCallsOrderClientWithUtcBounds() {
        service.getOrderStatusSummary("month", LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 30), false);

        verify(orderDashboardDataClient).countByCreatedBetween(START, END);
        verify(orderDashboardDataClient).countByStatusBetween(OrderStatus.PENDING, START, END);
        verify(orderDashboardDataClient).countByStatusBetween(OrderStatus.COMPLETED, START, END);
    }

    @Test
    void getRevenueCompareForExplicitRangeUsesPreviousSameLengthWindow() {
        String currentStart = "2026-05-10T00:00:00Z";
        String currentEnd = "2026-05-16T23:59:59.999999999Z";
        String previousStart = "2026-05-03T00:00:00Z";
        String previousEnd = "2026-05-09T23:59:59.999999999Z";

        when(orderDashboardDataClient.revenueByDay(currentStart, currentEnd))
                .thenReturn(List.of(revenuePoint("2026-05-16", "200000", 4)));
        when(orderDashboardDataClient.revenueByDay(previousStart, previousEnd))
                .thenReturn(List.of(revenuePoint("2026-05-09", "100000", 2)));

        var result = service.getRevenueCompare("week", LocalDate.of(2026, 5, 10), LocalDate.of(2026, 5, 16), false);

        assertThat(result.getRevenueGrowthPercent()).isEqualTo(100D);
        assertThat(result.getOrderGrowthPercent()).isEqualTo(100D);
        verify(orderDashboardDataClient).revenueByDay(currentStart, currentEnd);
        verify(orderDashboardDataClient).revenueByDay(previousStart, previousEnd);
    }

    private static OrderDataDTO.RevenueByDateItem revenuePoint(String date, String revenue, long orderCount) {
        return OrderDataDTO.RevenueByDateItem.builder()
                .date(date)
                .revenue(new BigDecimal(revenue))
                .orderCount(orderCount)
                .build();
    }
}
