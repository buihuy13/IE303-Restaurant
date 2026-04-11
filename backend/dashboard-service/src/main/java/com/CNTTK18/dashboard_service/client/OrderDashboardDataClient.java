package com.CNTTK18.dashboard_service.client;

import java.util.List;
import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.CNTTK18.dashboard_service.dto.order.OrderDataDTO;
import com.CNTTK18.dashboard_service.dto.order.OrderResponse;
import com.CNTTK18.dashboard_service.dto.order.OrderSummaryDTO;
import com.CNTTK18.dashboard_service.model.OrderStatus;

@FeignClient(name = "order-service")
public interface OrderDashboardDataClient {

    @GetMapping("/internal/dashboard/order-data/count-by-status")
    long countByStatus(@RequestParam("status") OrderStatus status);

    @GetMapping("/internal/dashboard/order-data/count-by-created-between")
    long countByCreatedBetween(@RequestParam("start") String start, @RequestParam("end") String end);

    @GetMapping("/internal/dashboard/order-data/count-by-status-between")
    long countByStatusBetween(
            @RequestParam("status") OrderStatus status,
            @RequestParam("start") String start,
            @RequestParam("end") String end);

    @GetMapping("/internal/dashboard/order-data/count-by-restaurant-status")
    long countByRestaurantStatus(
            @RequestParam("restaurantId") UUID restaurantId, @RequestParam("status") OrderStatus status);

    @GetMapping("/internal/dashboard/order-data/count-by-restaurant-created-between")
    long countByRestaurantCreatedBetween(
            @RequestParam("restaurantId") UUID restaurantId,
            @RequestParam("start") String start,
            @RequestParam("end") String end);

    @GetMapping("/internal/dashboard/order-data/count-by-restaurant-status-between")
    long countByRestaurantStatusBetween(
            @RequestParam("restaurantId") UUID restaurantId,
            @RequestParam("status") OrderStatus status,
            @RequestParam("start") String start,
            @RequestParam("end") String end);

    @GetMapping("/internal/dashboard/order-data/revenue-by-day")
    List<OrderDataDTO.RevenueByDateItem> revenueByDay(
            @RequestParam("start") String start, @RequestParam("end") String end);

    @GetMapping("/internal/dashboard/order-data/revenue-by-day-by-restaurant")
    List<OrderDataDTO.RevenueByDateItem> revenueByDayByRestaurant(
            @RequestParam("restaurantId") UUID restaurantId,
            @RequestParam("start") String start,
            @RequestParam("end") String end);

    @GetMapping("/internal/dashboard/order-data/top-products")
    List<OrderDataDTO.TopProductItem> topProducts(
            @RequestParam("start") String start, @RequestParam("end") String end, @RequestParam("limit") int limit);

    @GetMapping("/internal/dashboard/order-data/top-products-by-restaurant")
    List<OrderDataDTO.TopProductItem> topProductsByRestaurant(
            @RequestParam("restaurantId") UUID restaurantId,
            @RequestParam("start") String start,
            @RequestParam("end") String end,
            @RequestParam("limit") int limit);

    @GetMapping("/internal/dashboard/order-data/revenue-by-restaurant")
    List<OrderDataDTO.RevenueByRestaurantItem> revenueByRestaurant(
            @RequestParam("start") String start, @RequestParam("end") String end, @RequestParam("limit") int limit);

    @GetMapping("/internal/dashboard/order-data/hourly-orders")
    List<OrderDataDTO.HourlyOrderItem> hourlyOrders(
            @RequestParam("start") String start, @RequestParam("end") String end);

    @GetMapping("/internal/dashboard/order-data/recent-orders")
    List<OrderResponse> recentOrders(@RequestParam("limit") int limit);

    @GetMapping("/internal/dashboard/order-data/live-orders")
    List<OrderSummaryDTO> liveOrders(@RequestParam("restaurantId") UUID restaurantId);
}
