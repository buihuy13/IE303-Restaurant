package com.CNTTK18.dashboard_service.service.Impl;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.CNTTK18.dashboard_service.client.CatalogDashboardDataClient;
import com.CNTTK18.dashboard_service.client.OrderDashboardDataClient;
import com.CNTTK18.dashboard_service.client.QueryDashboardDataClient;
import com.CNTTK18.dashboard_service.client.UserDashboardDataClient;
import com.CNTTK18.dashboard_service.dto.dashboard.AdminOverviewResponse;
import com.CNTTK18.dashboard_service.dto.dashboard.DashboardStatsDTO;
import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantAdminStatsResponse;
import com.CNTTK18.dashboard_service.model.OrderStatus;
import com.CNTTK18.dashboard_service.service.AsyncDashboardDataService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncDashboardDataServiceImpl implements AsyncDashboardDataService {

    private final OrderDashboardDataClient orderClient;
    private final UserDashboardDataClient userClient;
    private final QueryDashboardDataClient queryClient;
    private final CatalogDashboardDataClient catalogClient;
    private final Executor dashboardExecutor;

    @Override
    @Cacheable(value = "admin-overview", key = "'admin'")
    public CompletableFuture<AdminOverviewResponse> getAdminOverviewAsync() {
        log.debug("Fetching admin overview data");

        CompletableFuture<Long> pendingOrders =
                supplyAsyncWithFallback(() -> orderClient.countByStatus(OrderStatus.PENDING), 0L);
        CompletableFuture<Long> completedOrders =
                supplyAsyncWithFallback(() -> orderClient.countByStatus(OrderStatus.COMPLETED), 0L);
        CompletableFuture<Long> cancelledOrders =
                supplyAsyncWithFallback(() -> orderClient.countByStatus(OrderStatus.CANCELLED), 0L);
        CompletableFuture<Long> totalUsers = supplyAsyncWithFallback(() -> userClient.countUsers(), 0L);
        CompletableFuture<Long> totalRestaurants = supplyAsyncWithFallback(() -> queryClient.countRestaurants(), 0L);
        CompletableFuture<Long> totalProducts = supplyAsyncWithFallback(() -> queryClient.countProducts(), 0L);
        CompletableFuture<Long> totalCategories = supplyAsyncWithFallback(() -> catalogClient.countCategories(), 0L);
        CompletableFuture<Double> avgRating =
                supplyAsyncWithFallback(() -> queryClient.getAverageRestaurantRating(), 0.0);
        CompletableFuture<Long> totalReviews = supplyAsyncWithFallback(() -> queryClient.countTotalReviews(), 0L);

        return CompletableFuture.allOf(
                        pendingOrders,
                        completedOrders,
                        cancelledOrders,
                        totalUsers,
                        totalRestaurants,
                        totalProducts,
                        totalCategories,
                        avgRating,
                        totalReviews)
                .thenApply(voidResult -> {
                    log.debug("Admin overview data fetched successfully");
                    return AdminOverviewResponse.builder()
                            .pendingOrders(pendingOrders.join())
                            .completedOrders(completedOrders.join())
                            .cancelledOrders(cancelledOrders.join())
                            .totalUsers(totalUsers.join())
                            .totalRestaurants(totalRestaurants.join())
                            .totalProducts(totalProducts.join())
                            .totalCategories(totalCategories.join())
                            .averageRating(avgRating.join() != null ? avgRating.join() : 0.0)
                            .totalReviews(totalReviews.join())
                            .build();
                })
                .exceptionally(ex -> {
                    log.error("Error fetching admin overview", ex);
                    return AdminOverviewResponse.builder().build();
                });
    }

    @Override
    @Cacheable(value = "restaurant-stats", key = "'admin'")
    public CompletableFuture<RestaurantAdminStatsResponse> getRestaurantStatsAsync() {
        log.debug("Fetching restaurant stats data");

        CompletableFuture<Long> totalRestaurants = supplyAsyncWithFallback(() -> queryClient.countRestaurants(), 0L);
        CompletableFuture<Long> totalProducts = supplyAsyncWithFallback(() -> queryClient.countProducts(), 0L);
        CompletableFuture<Long> totalCategories = supplyAsyncWithFallback(() -> catalogClient.countCategories(), 0L);
        CompletableFuture<Double> avgRating =
                supplyAsyncWithFallback(() -> queryClient.getAverageRestaurantRating(), 0.0);
        CompletableFuture<Long> totalReviews = supplyAsyncWithFallback(() -> queryClient.countTotalReviews(), 0L);

        return CompletableFuture.allOf(totalRestaurants, totalProducts, totalCategories, avgRating, totalReviews)
                .thenApply(voidResult -> {
                    log.debug("Restaurant stats data fetched successfully");
                    return RestaurantAdminStatsResponse.builder()
                            .totalRestaurants(totalRestaurants.join())
                            .totalProducts(totalProducts.join())
                            .totalCategories(totalCategories.join())
                            .averageRating(avgRating.join() != null ? avgRating.join() : 0.0)
                            .totalReviews(totalReviews.join())
                            .build();
                })
                .exceptionally(ex -> {
                    log.error("Error fetching restaurant stats", ex);
                    return RestaurantAdminStatsResponse.builder().build();
                });
    }

    @Override
    @Cacheable(value = "merchant-overview", key = "#restaurantId")
    public CompletableFuture<DashboardStatsDTO.OverviewResponse> getMerchantOverviewAsync(UUID restaurantId) {
        log.debug("Fetching merchant overview for restaurant: {}", restaurantId);

        CompletableFuture<Long> pendingOrders = supplyAsyncWithFallback(
                () -> orderClient.countByRestaurantStatus(restaurantId, OrderStatus.PENDING), 0L);
        CompletableFuture<Long> completedOrders = supplyAsyncWithFallback(
                () -> orderClient.countByRestaurantStatus(restaurantId, OrderStatus.COMPLETED), 0L);
        CompletableFuture<Long> cancelledOrders = supplyAsyncWithFallback(
                () -> orderClient.countByRestaurantStatus(restaurantId, OrderStatus.CANCELLED), 0L);
        CompletableFuture<Long> totalProducts =
                supplyAsyncWithFallback(() -> queryClient.countProductsByRestaurant(restaurantId), 0L);

        return CompletableFuture.allOf(pendingOrders, completedOrders, cancelledOrders, totalProducts)
                .thenApply(voidResult -> {
                    log.debug("Merchant overview data fetched successfully");
                    long pending = pendingOrders.join();
                    long completed = completedOrders.join();
                    long cancelled = cancelledOrders.join();

                    return DashboardStatsDTO.OverviewResponse.builder()
                            .revenueToday(null)
                            .revenueThisMonth(null)
                            .ordersToday(pending + completed + cancelled)
                            .pendingOrders(pending)
                            .completedOrders(completed)
                            .cancelledOrders(cancelled)
                            .build();
                })
                .exceptionally(ex -> {
                    log.error("Error fetching merchant overview for restaurant: {}", restaurantId, ex);
                    return DashboardStatsDTO.OverviewResponse.builder().build();
                });
    }

    private <T> CompletableFuture<T> supplyAsyncWithFallback(java.util.function.Supplier<T> supplier, T fallback) {
        return CompletableFuture.supplyAsync(supplier, dashboardExecutor).exceptionally(ex -> {
            log.warn("Service call failed, using fallback value: {}", ex.getMessage());
            return fallback;
        });
    }
}
