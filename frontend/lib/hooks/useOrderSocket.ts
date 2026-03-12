"use client";

import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { ORDER_SOCKET_URL } from "../config/publicRuntime";

interface OrderNotification {
    type: string;
    // For new-order event
    data?: {
        orderId: string;
        totalAmount?: number;
        itemCount?: number;
        customerNote?: string;
        createdAt?: string;
        status?: string;
        restaurantName?: string;
        reason?: string;
    };
    // For order-status-updated event (fields at root level)
    orderId?: string;
    status?: string;
    previousStatus?: string;
    paymentStatus?: string;
    cancellationReason?: string;
    timestamp: Date;
    sound?: string;
}

interface UseOrderSocketOptions {
    restaurantId?: string | null;
    userId?: string | null;
    onNewOrder?: (notification: OrderNotification) => void;
    onOrderStatusUpdate?: (notification: OrderNotification) => void;
}

export function useOrderSocket({ restaurantId, userId, onNewOrder, onOrderStatusUpdate }: UseOrderSocketOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const onNewOrderRef = useRef<UseOrderSocketOptions["onNewOrder"]>(onNewOrder);
    const onOrderStatusUpdateRef = useRef<UseOrderSocketOptions["onOrderStatusUpdate"]>(onOrderStatusUpdate);

    useEffect(() => {
        onNewOrderRef.current = onNewOrder;
    }, [onNewOrder]);

    useEffect(() => {
        onOrderStatusUpdateRef.current = onOrderStatusUpdate;
    }, [onOrderStatusUpdate]);

    useEffect(() => {
        // Order-service WebSocket via Socket.IO is not enabled in the current setup,
        // so we skip creating a socket connection to avoid ERR_CONNECTION_REFUSED noise.
        // The hook still returns a stable API shape for future use.
        setIsConnected(false);
        socketRef.current = null;

        return () => {
            socketRef.current = null;
        };
    }, [restaurantId, userId]);

    return {
        isConnected,
        socket: socketRef.current,
    };
}
