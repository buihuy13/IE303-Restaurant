package com.CNTTK18.order_service.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Event.MerchantRevenueEvent;
import com.CNTTK18.Common.Event.OrderNotificationEvent;
import com.CNTTK18.order_service.client.RestaurantClient;
import com.CNTTK18.order_service.dto.client.ResClientResponse;
import com.CNTTK18.order_service.dto.order.request.CheckoutRequest;
import com.CNTTK18.order_service.dto.order.request.UpdateOrderStatusRequest;
import com.CNTTK18.order_service.dto.order.response.OrderResponse;
import com.CNTTK18.order_service.exception.BadRequestException;
import com.CNTTK18.order_service.exception.ForbiddenException;
import com.CNTTK18.order_service.exception.NotFoundException;
import com.CNTTK18.order_service.mapper.OrderMapper;
import com.CNTTK18.order_service.messaging.MerchantRevenuePublisher;
import com.CNTTK18.order_service.messaging.OrderNotificationPublisher;
import com.CNTTK18.order_service.model.Cart;
import com.CNTTK18.order_service.model.CartRestaurantGroup;
import com.CNTTK18.order_service.model.Order;
import com.CNTTK18.order_service.model.OrderItem;
import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.model.data.PaymentStatus;
import com.CNTTK18.order_service.repository.CartRepository;
import com.CNTTK18.order_service.repository.OrderRepository;
import com.CNTTK18.order_service.service.OrderService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OrderMapper orderMapper;
    private final RestaurantClient restaurantClient;
    private final OrderNotificationPublisher notificationPublisher;
    private final MerchantRevenuePublisher merchantRevenuePublisher;

    @Override
    /**
     * Creates one order per selected restaurant from the current cart.
     *
     * Flow: load cart -> validate/build orders -> persist orders and update cart.
     */
    public List<OrderResponse> checkout(UUID userId, CheckoutRequest request) {
        Cart cart = loadCartOrThrow(userId);
        CheckoutBuildResult checkoutBuildResult = buildOrdersAndGroupsToRemove(userId, request, cart);

        List<Order> savedOrders =
                saveOrdersAndUpdateCart(cart, checkoutBuildResult.newOrders(), checkoutBuildResult.groupsToRemove());

        savedOrders.forEach(order -> notificationPublisher.publish(new OrderNotificationEvent(
                order.getId(),
                order.getUserId(),
                order.getMerchantId(),
                null,
                order.getRestaurantName(),
                order.getTotalPrice(),
                order.getStatus().name(),
                order.getDeliveryAddress())));

        return orderMapper.toResponseList(savedOrders);
    }

    @Override
    public List<OrderResponse> getEmployeeOrders(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByUserId(userId, pageable);
        return orderMapper.toResponseList(orders.getContent());
    }

    @Override
    public List<OrderResponse> getRestaurantOrders(
            UUID restaurantId, UUID currentUserId, String currentUserRole, int page, int size) {
        if (!"ADMIN".equals(currentUserRole)) {
            validateRestaurantOwnership(restaurantId, currentUserId);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByRestaurantId(restaurantId, pageable);
        return orderMapper.toResponseList(orders.getContent());
    }

    @Override
    public OrderResponse getOrderById(UUID orderId, UUID currentUserId, String currentUserRole) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found"));

        if (!"ADMIN".equals(currentUserRole)) {
            if ("USER".equals(currentUserRole) || "MERCHANT".equals(currentUserRole)) {
                boolean isOrderOwner = order.getUserId().equals(currentUserId);
                boolean isRestaurantOwner = isRestaurantOwner(order.getRestaurantId(), currentUserId);
                if (!isOrderOwner && !isRestaurantOwner) {
                    throw new com.CNTTK18.order_service.exception.ForbiddenException(
                            "You are not authorized to view this order");
                }
            }
        }

        return orderMapper.toResponse(order);
    }

    @Override
    public OrderResponse updateStatus(
            UUID orderId, UUID currentUserId, String currentUserRole, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found"));

        if (!"ADMIN".equals(currentUserRole)) {
            validateRestaurantOwnership(order.getRestaurantId(), currentUserId);
        }

        if (request.getStatus() == OrderStatus.COMPLETED && order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("Order has not been paid yet");
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(request.getStatus());
        Order saved = orderRepository.save(order);

        notificationPublisher.publish(new OrderNotificationEvent(
                saved.getId(),
                saved.getUserId(),
                saved.getMerchantId(),
                null,
                saved.getRestaurantName(),
                saved.getTotalPrice(),
                saved.getStatus().name(),
                saved.getDeliveryAddress()));

        publishMerchantRevenueIfCompleted(previousStatus, saved);

        return orderMapper.toResponse(saved);
    }

    @Override
    public OrderResponse cancelOrder(UUID userId, UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new ForbiddenException("You are not authorized to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order can only be cancelled while in PENDING status");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        Order saved = orderRepository.save(order);

        notificationPublisher.publish(new OrderNotificationEvent(
                saved.getId(),
                saved.getUserId(),
                saved.getMerchantId(),
                null,
                saved.getRestaurantName(),
                saved.getTotalPrice(),
                saved.getStatus().name(),
                saved.getDeliveryAddress()));

        return orderMapper.toResponse(saved);
    }

    @Override
    public void updatePaymentStatus(UUID orderId, boolean success, Long orderCode, String paymentLinkId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found"));

        if (order.getOrderCode() != null && !order.getOrderCode().equals(orderCode)) {
            throw new BadRequestException("Order code does not match");
        }

        order.setPaymentStatus(success ? PaymentStatus.PAID : PaymentStatus.FAILED);
        order.setOrderCode(orderCode);
        order.setPaymentLinkId(paymentLinkId);

        Order saved = orderRepository.save(order);

        notificationPublisher.publish(new OrderNotificationEvent(
                saved.getId(),
                saved.getUserId(),
                saved.getMerchantId(),
                null,
                saved.getRestaurantName(),
                saved.getTotalPrice(),
                saved.getPaymentStatus().name(),
                saved.getDeliveryAddress()));
    }

    private void validateRestaurantOwnership(UUID restaurantId, UUID currentUserId) {
        ResClientResponse resInfo = restaurantClient.getRestaurant(restaurantId).block();
        if (resInfo == null) {
            throw new NotFoundException("Restaurant not found: " + restaurantId);
        }
        if (!currentUserId.equals(resInfo.getMerchantId())) {
            throw new com.CNTTK18.order_service.exception.ForbiddenException(
                    "You are not the owner of this restaurant");
        }
    }

    private boolean isRestaurantOwner(UUID restaurantId, UUID currentUserId) {
        try {
            ResClientResponse resInfo = restaurantClient.getRestaurant(restaurantId).block();
            return resInfo != null && currentUserId.equals(resInfo.getMerchantId());
        } catch (Exception e) {
            return false;
        }
    }

    private Cart loadCartOrThrow(UUID userId) {
        return cartRepository.findByUserId(userId).orElseThrow(() -> new NotFoundException("Cart not found"));
    }

    private CheckoutBuildResult buildOrdersAndGroupsToRemove(UUID userId, CheckoutRequest request, Cart cart) {
        List<RestaurantOrderDraft> drafts = Flux.fromIterable(request.getRestaurantIds())
                .flatMapSequential(restaurantId -> {
                    CartRestaurantGroup group = findRestaurantGroupInCartOrThrow(cart, restaurantId);
                    return validateRestaurantAvailableForCheckout(restaurantId)
                            .map(resInfo -> new RestaurantOrderDraft(restaurantId, resInfo, group));
                })
                .collectList()
                .block();

        if (drafts == null) {
            throw new BadRequestException("Unable to build checkout orders");
        }

        List<Order> newOrders = drafts.stream()
                .map(draft -> buildOrder(userId, draft.restaurantId(), draft.resInfo(), draft.group(), request))
                .toList();
        List<CartRestaurantGroup> groupsToRemove = drafts.stream().map(RestaurantOrderDraft::group).toList();

        return new CheckoutBuildResult(newOrders, groupsToRemove);
    }

    private CartRestaurantGroup findRestaurantGroupInCartOrThrow(Cart cart, UUID restaurantId) {
        return cart.getRestaurants().stream()
                .filter(g -> g.getRestaurantId().equals(restaurantId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Restaurant " + restaurantId + " not found in cart"));
    }

    private Mono<ResClientResponse> validateRestaurantAvailableForCheckout(UUID restaurantId) {
        return restaurantClient.getRestaurant(restaurantId).map(resInfo -> {
            if (resInfo == null || !resInfo.isEnabled()) {
                throw new BadRequestException("Restaurant " + (resInfo != null ? resInfo.getResName() : restaurantId)
                        + " is currently unavailable");
            }
            if (resInfo.getMerchantId() == null) {
                throw new BadRequestException("Restaurant " + restaurantId + " does not have a merchant owner");
            }
            return resInfo;
        });
    }

    private Order buildOrder(
            UUID userId,
            UUID restaurantId,
            ResClientResponse resInfo,
            CartRestaurantGroup group,
            CheckoutRequest request) {
        return Order.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .restaurantId(restaurantId)
                .merchantId(resInfo.getMerchantId())
                .restaurantName(group.getRestaurantName())
                .items(mapToOrderItems(group))
                .totalPrice(calculateTotalPrice(group))
                .deliveryAddress(request.getDeliveryAddress())
                .note(request.getNote())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();
    }

    private List<OrderItem> mapToOrderItems(CartRestaurantGroup group) {
        return group.getItems().stream()
                .map(item -> OrderItem.builder()
                        .productId(item.getProductId())
                        .productSizeId(item.getProductSizeId())
                        .productName(item.getProductName())
                        .sizeName(item.getSizeName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .build())
                .toList();
    }

    private BigDecimal calculateTotalPrice(CartRestaurantGroup group) {
        return group.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void publishMerchantRevenueIfCompleted(OrderStatus previousStatus, Order saved) {
        if (previousStatus == OrderStatus.COMPLETED || saved.getStatus() != OrderStatus.COMPLETED) {
            return;
        }
        if (saved.getPaymentStatus() != PaymentStatus.PAID) {
            return;
        }

        UUID merchantId = saved.getMerchantId();
        if (merchantId == null) {
            ResClientResponse resInfo = restaurantClient.getRestaurant(saved.getRestaurantId()).block();
            if (resInfo == null || resInfo.getMerchantId() == null) {
                throw new BadRequestException("Cannot resolve merchant owner for completed order");
            }
            merchantId = resInfo.getMerchantId();
            saved.setMerchantId(merchantId);
            orderRepository.save(saved);
        }

        Long amount = saved.getTotalPrice() == null ? 0L : saved.getTotalPrice().longValue();
        MerchantRevenueEvent event = new MerchantRevenueEvent(
                saved.getId(),
                merchantId,
                saved.getRestaurantId(),
                amount,
                Instant.now(),
                "order:" + saved.getId() + ":merchant-revenue");
        merchantRevenuePublisher.publish(event);
    }

    private List<Order> saveOrdersAndUpdateCart(
            Cart cart, List<Order> newOrders, List<CartRestaurantGroup> groupsToRemove) {
        List<Order> savedOrders = orderRepository.saveAll(newOrders);
        cart.getRestaurants().removeAll(groupsToRemove);
        cartRepository.save(cart);
        return savedOrders;
    }

    private record CheckoutBuildResult(List<Order> newOrders, List<CartRestaurantGroup> groupsToRemove) {}

    private record RestaurantOrderDraft(UUID restaurantId, ResClientResponse resInfo, CartRestaurantGroup group) {}
}
