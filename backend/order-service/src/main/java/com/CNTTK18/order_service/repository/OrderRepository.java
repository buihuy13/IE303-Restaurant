package com.CNTTK18.order_service.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.CNTTK18.order_service.model.Order;
import com.CNTTK18.order_service.model.data.OrderStatus;

@Repository
public interface OrderRepository extends MongoRepository<Order, UUID> {
    Page<Order> findByUserId(UUID userId, Pageable pageable);

    Page<Order> findByRestaurantId(UUID restaurantId, Pageable pageable);

    long countByStatus(OrderStatus status);

    long countByCreatedAtBetween(Instant start, Instant end);

    long countByStatusAndCreatedAtBetween(OrderStatus status, Instant start, Instant end);

    long countByRestaurantIdAndCreatedAtBetween(UUID restaurantId, Instant start, Instant end);

    long countByRestaurantIdAndStatus(UUID restaurantId, OrderStatus status);

    long countByRestaurantIdAndStatusAndCreatedAtBetween(
            UUID restaurantId, OrderStatus status, Instant start, Instant end);

    @Query("{ 'status': 'COMPLETED', 'createdAt': { $gte: ?0, $lte: ?1 } }")
    List<Order> findCompletedOrdersBetween(Instant start, Instant end);

    @Query("{ 'restaurantId': ?0, 'status': 'COMPLETED', 'createdAt': { $gte: ?1, $lte: ?2 } }")
    List<Order> findCompletedOrdersByRestaurantIdBetween(UUID restaurantId, Instant start, Instant end);

    @Aggregation(
            pipeline = {
                "{ $match: { 'status': 'COMPLETED', 'createdAt': { $gte: ?0, $lte: ?1 } } }",
                "{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, revenue: { $sum: '$totalPrice' }, orderCount: { $sum: 1 } } }",
                "{ $project: { _id: 0, date: '$_id', revenue: 1, orderCount: 1 } }",
                "{ $sort: { date: 1 } }"
            })
    List<RevenueByDateProjection> aggregateRevenueByDay(Instant start, Instant end);

    @Aggregation(
            pipeline = {
                "{ $match: { 'restaurantId': ?0, 'status': 'COMPLETED', 'createdAt': { $gte: ?1, $lte: ?2 } } }",
                "{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, revenue: { $sum: '$totalPrice' }, orderCount: { $sum: 1 } } }",
                "{ $project: { _id: 0, date: '$_id', revenue: 1, orderCount: 1 } }",
                "{ $sort: { date: 1 } }"
            })
    List<RevenueByDateProjection> aggregateRevenueByDayByRestaurant(UUID restaurantId, Instant start, Instant end);

    @Aggregation(
            pipeline = {
                "{ $match: { 'status': 'COMPLETED', 'createdAt': { $gte: ?0, $lte: ?1 } } }",
                "{ $unwind: '$items' }",
                "{ $group: { _id: { productId: '$items.productId', productSizeId: '$items.productSizeId' }, productName: { $first: '$items.productName' }, sizeName: { $first: '$items.sizeName' }, totalQuantitySold: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }",
                "{ $project: { _id: 0, productId: '$_id.productId', productSizeId: '$_id.productSizeId', productName: 1, sizeName: 1, totalQuantitySold: 1, totalRevenue: 1 } }",
                "{ $sort: { totalQuantitySold: -1, totalRevenue: -1 } }",
                "{ $limit: ?2 }"
            })
    List<TopProductProjection> aggregateTopProducts(Instant start, Instant end, int limit);

    @Aggregation(
            pipeline = {
                "{ $match: { 'restaurantId': ?0, 'status': 'COMPLETED', 'createdAt': { $gte: ?1, $lte: ?2 } } }",
                "{ $unwind: '$items' }",
                "{ $group: { _id: { productId: '$items.productId', productSizeId: '$items.productSizeId' }, productName: { $first: '$items.productName' }, sizeName: { $first: '$items.sizeName' }, totalQuantitySold: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }",
                "{ $project: { _id: 0, productId: '$_id.productId', productSizeId: '$_id.productSizeId', productName: 1, sizeName: 1, totalQuantitySold: 1, totalRevenue: 1 } }",
                "{ $sort: { totalQuantitySold: -1, totalRevenue: -1 } }",
                "{ $limit: ?3 }"
            })
    List<TopProductProjection> aggregateTopProductsByRestaurant(
            UUID restaurantId, Instant start, Instant end, int limit);

    @Aggregation(
            pipeline = {
                "{ $match: { 'status': 'COMPLETED', 'createdAt': { $gte: ?0, $lte: ?1 } } }",
                "{ $group: { _id: { restaurantId: '$restaurantId', restaurantName: '$restaurantName' }, revenue: { $sum: '$totalPrice' }, orderCount: { $sum: 1 } } }",
                "{ $project: { _id: 0, restaurantId: '$_id.restaurantId', restaurantName: '$_id.restaurantName', revenue: 1, orderCount: 1 } }",
                "{ $sort: { revenue: -1 } }",
                "{ $limit: ?2 }"
            })
    List<RevenueByRestaurantProjection> aggregateRevenueByRestaurant(Instant start, Instant end, int limit);

    @Aggregation(
            pipeline = {
                "{ $match: { 'createdAt': { $gte: ?0, $lte: ?1 } } }",
                "{ $group: { _id: { $hour: { date: '$createdAt', timezone: 'UTC' } }, orderCount: { $sum: 1 } } }",
                "{ $project: { _id: 0, hour: '$_id', orderCount: 1 } }",
                "{ $sort: { hour: 1 } }"
            })
    List<HourlyOrderProjection> aggregateHourlyOrders(Instant start, Instant end);

    List<Order> findByRestaurantIdAndStatusInOrderByCreatedAtAsc(UUID restaurantId, List<OrderStatus> statuses);

    List<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    interface RevenueByDateProjection {
        String getDate();

        BigDecimal getRevenue();

        long getOrderCount();
    }

    interface TopProductProjection {
        UUID getProductId();

        UUID getProductSizeId();

        String getProductName();

        String getSizeName();

        long getTotalQuantitySold();

        BigDecimal getTotalRevenue();
    }

    interface RevenueByRestaurantProjection {
        UUID getRestaurantId();

        String getRestaurantName();

        BigDecimal getRevenue();

        long getOrderCount();
    }

    interface HourlyOrderProjection {
        Integer getHour();

        long getOrderCount();
    }
}
