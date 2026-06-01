import type { OrderNotification } from "@/lib/hooks/useOrderSocket";

type OrderStatusListener = (notification: OrderNotification) => void;
type NewOrderListener = (notification: OrderNotification) => void;

const statusListeners = new Set<OrderStatusListener>();
const newOrderListeners = new Set<NewOrderListener>();

export type OrderSSEPayload = {
    title?: string;
    message?: string;
    type?: string;
    eventType?: string;
    status?: string;
    orderStatus?: string;
    paymentStatus?: string;
    orderId?: string;
    restaurantName?: string;
    reason?: string;
};

export function subscribeOrderStatusUpdates(listener: OrderStatusListener): () => void {
    statusListeners.add(listener);
    return () => statusListeners.delete(listener);
}

export function subscribeNewOrders(listener: NewOrderListener): () => void {
    newOrderListeners.add(listener);
    return () => newOrderListeners.delete(listener);
}

export function emitOrderStatusUpdate(notification: OrderNotification): void {
    statusListeners.forEach((listener) => listener(notification));
}

export function emitNewOrder(notification: OrderNotification): void {
    newOrderListeners.forEach((listener) => listener(notification));
}

/** Map global notification SSE payload → shape expected by order list/detail hooks. */
export function orderNotificationFromSSEPayload(
    payload: OrderSSEPayload,
    eventName = "message",
): OrderNotification {
    const status = (payload.orderStatus || payload.status || payload.type || eventName || "").trim();
    const orderId = payload.orderId?.trim() || undefined;

    return {
        type: "ORDER_NOTIFICATION",
        eventType: payload.eventType,
        data: orderId
            ? {
                  orderId,
                  status,
                  paymentStatus: payload.paymentStatus,
                  restaurantName: payload.restaurantName || "",
                  createdAt: new Date().toISOString(),
              }
            : undefined,
        orderId,
        status,
        paymentStatus: payload.paymentStatus,
        timestamp: new Date(),
    };
}
