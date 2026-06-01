package com.CNTTK18.Common.Event;

public final class PaymentStatusSyncContract {
    public static final String EXCHANGE = "payment_status_exchange";
    public static final String ROUTING_KEY = "payment.status.updated";
    public static final String QUEUE = "payment_status_queue";

    private PaymentStatusSyncContract() {}
}
