package com.CNTTK18.order_service.config;

import java.time.Instant;

import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;

import com.CNTTK18.order_service.model.Order;

/**
 * Ensures time fields are always populated before persisting orders.
 * This protects createdAt for newly created orders even when IDs are pre-assigned.
 */
@Component
public class OrderMongoLifecycleListener extends AbstractMongoEventListener<Order> {

    @Override
    public void onBeforeConvert(BeforeConvertEvent<Order> event) {
        Order order = event.getSource();
        Instant now = Instant.now();

        if (order.getCreatedAt() == null) {
            order.setCreatedAt(now);
        }

        if (order.getUpdatedAt() == null) {
            order.setUpdatedAt(now);
        }
    }
}
