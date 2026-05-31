package com.CNTTK18.dashboard_service.dto.order;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class OrderDataDTO {
    private OrderDataDTO() {}

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByDateItem {
        private String date;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductItem {
        private UUID productId;
        private String productName;
        private String sizeName;
        private long totalQuantitySold;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByRestaurantItem {
        private UUID restaurantId;
        private String restaurantName;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyOrderItem {
        private Integer hour;
        private long orderCount;
    }
}
