package com.CNTTK18.dashboard_service.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class DashboardStatsDTO {
    private DashboardStatsDTO() {}

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OverviewResponse {
        private BigDecimal revenueToday;
        private BigDecimal revenueThisMonth;
        private long ordersToday;
        private long pendingOrders;
        private long completedOrders;
        private long cancelledOrders;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueByDate {
        private String date;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueResponse {
        private BigDecimal totalRevenue;
        private long totalOrders;
        private List<RevenueByDate> breakdown;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueCompareResponse {
        private RevenueResponse current;
        private RevenueResponse previous;
        private double revenueGrowthPercent;
        private double orderGrowthPercent;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderStatusResponse {
        private long total;
        private long pending;
        private long confirmed;
        private long preparing;
        private long delivering;
        private long completed;
        private long cancelled;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class HourlyOrderResponse {
        private int hour;
        private long orderCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopProductItem {
        private UUID productId;
        private String productName;
        private String sizeName;
        private long totalQuantitySold;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopProductsResponse {
        private List<TopProductItem> items;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueByRestaurantItem {
        private UUID restaurantId;
        private String restaurantName;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueByRestaurantResponse {
        private List<RevenueByRestaurantItem> items;
    }
}
