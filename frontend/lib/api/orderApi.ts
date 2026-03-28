import { Order, OrderStatus } from "@/types/order.type";
import { AxiosError } from "axios";
import api from "../axios";
import { restaurantApi } from "./restaurantApi";
import { withOrderServiceBase } from "./serviceBaseConfig";

const idStr = (v: unknown): string => (v == null || v === "" ? "" : String(v));

const numUnknown = (v: unknown): number => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

/** Maps order-service / Mongo payloads to the frontend Order shape (handles UUID strings, totalPrice, note, etc.). */
function normalizeOrderDto(raw: unknown): Order {
    if (!raw || typeof raw !== "object") {
        return {
            orderId: "",
            slug: "",
            userId: "",
            restaurant: { id: "", name: "" },
            items: [],
            deliveryAddress: { street: "", city: "", state: "", zipCode: "" },
            totalAmount: 0,
            discount: 0,
            deliveryFee: 0,
            tax: 0,
            finalAmount: 0,
            paymentMethod: "card",
            status: OrderStatus.PENDING,
            paymentStatus: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
    const r = raw as Record<string, unknown>;

    const orderId = idStr(r.orderId) || idStr(r.id) || idStr(r._id);
    const slug = idStr(r.slug) || orderId;
    const userId = idStr(r.userId);

    const restaurant =
        r.restaurant && typeof r.restaurant === "object" ? (r.restaurant as Record<string, unknown>) : null;
    const restaurantId = idStr(r.restaurantId ?? restaurant?.id);
    const restaurantName =
        typeof r.restaurantName === "string"
            ? r.restaurantName
            : typeof restaurant?.name === "string"
              ? restaurant.name
              : "";

    const num = (v: unknown): number => {
        if (typeof v === "number" && Number.isFinite(v)) return v;
        if (typeof v === "string" && v.trim() !== "") {
            const n = Number(v);
            return Number.isFinite(n) ? n : 0;
        }
        return 0;
    };

    const items = Array.isArray(r.items)
        ? r.items.map((it) => {
              const i = it as Record<string, unknown>;
              return {
                  productId: idStr(i.productId ?? i.product_id),
                  productName:
                      typeof i.productName === "string"
                          ? i.productName
                          : typeof i.product_name === "string"
                            ? i.product_name
                            : "Item",
                  quantity: typeof i.quantity === "number" ? i.quantity : Number(i.quantity) || 0,
                  price: num(i.price),
                  customizations: typeof i.customizations === "string" ? i.customizations : undefined,
                  imageURL:
                      typeof i.imageURL === "string"
                          ? i.imageURL
                          : typeof i.imageUrl === "string"
                            ? i.imageUrl
                            : undefined,
                  cartItemImage: typeof i.cartItemImage === "string" ? i.cartItemImage : undefined,
              };
          })
        : [];

    const finalAmount =
        num(r.finalAmount) || num(r.totalAmount) || num(r.totalPrice) || items.reduce((s, it) => s + it.price * it.quantity, 0);

    const statusRaw = typeof r.status === "string" ? r.status : String(r.status ?? "");
    const statusLower = statusRaw.toLowerCase();
    const allowed = new Set<string>(Object.values(OrderStatus));
    const status = (allowed.has(statusLower) ? statusLower : OrderStatus.PENDING) as Order["status"];

    const paymentStatusRaw =
        typeof r.paymentStatus === "string" ? r.paymentStatus.toLowerCase() : "pending";

    let deliveryAddress = { street: "", city: "", state: "", zipCode: "" };
    if (r.deliveryAddress && typeof r.deliveryAddress === "object") {
        const d = r.deliveryAddress as Record<string, unknown>;
        deliveryAddress = {
            street: typeof d.street === "string" ? d.street : "",
            city: typeof d.city === "string" ? d.city : "",
            state: typeof d.state === "string" ? d.state : "",
            zipCode:
                typeof d.zipCode === "string" ? d.zipCode : typeof d.zip_code === "string" ? d.zip_code : "",
        };
    } else if (typeof r.deliveryAddress === "string" && r.deliveryAddress.trim() !== "") {
        deliveryAddress = { street: r.deliveryAddress, city: "", state: "", zipCode: "" };
    }

    const createdAt =
        typeof r.createdAt === "string"
            ? r.createdAt
            : r.createdAt instanceof Date
              ? r.createdAt.toISOString()
              : new Date().toISOString();
    const updatedAt =
        typeof r.updatedAt === "string"
            ? r.updatedAt
            : r.updatedAt instanceof Date
              ? r.updatedAt.toISOString()
              : createdAt;

    const pm = r.paymentMethod;
    const paymentMethod: Order["paymentMethod"] =
        pm === "cash" || pm === "wallet" || pm === "card" ? pm : "card";

    return {
        orderId,
        slug,
        userId,
        restaurant: { id: restaurantId, name: restaurantName },
        restaurantId: restaurantId || undefined,
        items,
        deliveryAddress,
        totalAmount: num(r.totalAmount) || finalAmount,
        discount: num(r.discount),
        deliveryFee: num(r.deliveryFee),
        tax: num(r.tax),
        finalAmount,
        paymentMethod,
        status,
        paymentStatus: paymentStatusRaw as Order["paymentStatus"],
        orderNote:
            typeof r.orderNote === "string"
                ? r.orderNote
                : typeof r.note === "string"
                  ? r.note
                  : undefined,
        createdAt,
        updatedAt,
    };
}

function parseUserOrdersPayload(body: unknown): { orders: Order[]; pagination?: unknown } {
    if (body == null || typeof body !== "object") {
        return { orders: [] };
    }
    const b = body as Record<string, unknown>;
    const inner: unknown = b.data !== undefined ? b.data : b;

    if (Array.isArray(inner)) {
        return { orders: inner.map(normalizeOrderDto) };
    }
    if (inner && typeof inner === "object") {
        const obj = inner as Record<string, unknown>;
        if (Array.isArray(obj.orders)) {
            return {
                orders: obj.orders.map(normalizeOrderDto),
                pagination: obj.pagination,
            };
        }
        if (Array.isArray(obj.content)) {
            const page = obj;
            const total = numUnknown(page.totalElements);
            const size = numUnknown(page.size);
            const totalPages = numUnknown(page.totalPages);
            const numberZeroBased = numUnknown(page.number);
            return {
                orders: obj.content.map(normalizeOrderDto),
                pagination:
                    total > 0 || totalPages > 0
                        ? {
                              page: numberZeroBased + 1,
                              limit: size || (Array.isArray(obj.content) ? obj.content.length : 0),
                              total,
                              totalPages: totalPages || 1,
                          }
                        : undefined,
            };
        }
    }
    return { orders: [] };
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CreateOrderRequest {
    userId: string;
    restaurantId: string;
    restaurantName: string;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    items: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        customizations?: string;
    }[];
    paymentMethod: "card";
    orderNote?: string;
    discount?: number;
    deliveryFee?: number;
    userLat: number;
    userLon: number;
}

export const orderApi = {
    // Public: Get an order by ID
    getOrderById: async (orderId: string, options?: { cacheBust?: boolean }): Promise<Order> => {
        const cacheBust = options?.cacheBust !== false; // Default to true
        const url = cacheBust ? `/orders/${orderId}?t=${Date.now()}` : `/orders/${orderId}`;
        const response = await api.get<{ success: boolean; data: Order }>(url, withOrderServiceBase());
        return response.data.data;
    },

    // Public: Get an order by slug
    getOrderBySlug: async (slug: string, options?: { cacheBust?: boolean }): Promise<Order> => {
        // Add cache-busting query param to force fetch fresh data.
        // Avoid sending custom cache-control headers here because they trigger
        // a CORS preflight and the backend does not allow them in Access-Control-Allow-Headers.
        const cacheBust = options?.cacheBust !== false; // Default to true
        const url = cacheBust ? `/orders/slug/${slug}?t=${Date.now()}` : `/orders/slug/${slug}`;

        const response = await api.get<{ success: boolean; data: Order }>(url, withOrderServiceBase());
        return response.data.data;
    },

    // Create new order
    createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
        try {
            const response = await api.post<{ success: boolean; message: string; data: Order }>(
                "/orders",
                orderData,
                withOrderServiceBase(),
            );
            return response.data.data;
        } catch (error: unknown) {
            // Re-throw error with better message for restaurant closed errors
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Failed to create order";

            // Enhance error message for restaurant closed
            if (errorMessage.includes("Restaurant is currently closed") || errorMessage.includes("currently closed")) {
                const restaurantMatch = errorMessage.match(/Restaurant is currently closed: (.+)/);
                const restaurantName = restaurantMatch ? restaurantMatch[1] : orderData.restaurantName;
                throw new Error(
                    `Restaurant "${restaurantName}" is currently closed. Please check its operating hours and try again later.`
                );
            }

            // Re-throw original error
            throw error;
        }
    },

    // Get all orders (Admin only)
    getAllOrders: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{ orders: Order[]; pagination?: Pagination }> => {
        const search = new URLSearchParams();
        if (params?.page) search.append("page", params.page.toString());
        if (params?.limit) search.append("limit", params.limit.toString());
        if (params?.status) search.append("status", params.status);

        const response = await api.get<{
            status: string;
            message: string;
            data: { orders: Order[]; pagination?: Pagination };
        }>(`/orders${search.toString() ? `?${search.toString()}` : ""}`, withOrderServiceBase());

        return {
            orders: response.data.data.orders,
            pagination: response.data.data.pagination,
        };
    },

    // Get orders by restaurant (Manager/Merchant)
    getOrdersByRestaurant: async (
        restaurantId: string,
        merchantId?: string,
        filters?: { status?: string; page?: number; limit?: number }
    ): Promise<{ orders: Order[]; pagination?: Pagination }> => {
        const params = new URLSearchParams();
        if (merchantId) params.append("merchantId", merchantId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());

        try {
            const response = await api.get<{ success: boolean; data: Order[]; pagination?: Pagination }>(
                `/merchant/orders/restaurants/${restaurantId}/orders${params.toString() ? `?${params.toString()}` : ""}`,
                withOrderServiceBase(),
            );
            return { orders: response.data.data, pagination: response.data.pagination };
        } catch (error: unknown) {
            console.error(`Failed to get orders for restaurant ${restaurantId}:`, error);
            // Re-throw so the caller can handle it
            throw error;
        }
    },

    /**
     * Lists orders for a user (order-service).
     * Expects: `GET /orders/user/{userId}` with body like `{ success?: boolean; data: Order[] | { orders; pagination } }`
     * or Spring `Page` in `data.content`. Empty list on HTTP 404.
     *
     * Backend / gateway checklist (see team notes if calls fail):
     * - api-gateway must route `/api/cart/**` and `/api/orders/**` to `order-service`.
     * - order-service should expose this route and return DTO fields compatible with `normalizeOrderDto`.
     */
    getOrdersByUser: async (userId: string): Promise<{ orders: Order[]; pagination?: unknown }> => {
        if (!userId?.trim()) {
            return { orders: [], pagination: undefined };
        }
        try {
            const response = await api.get<unknown>(
                `/orders/user/${encodeURIComponent(userId.trim())}`,
                withOrderServiceBase(),
            );
            return parseUserOrdersPayload(response.data);
        } catch (error: unknown) {
            const status = error instanceof AxiosError ? error.response?.status : (error as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
                return { orders: [], pagination: undefined };
            }
            throw error;
        }
    },

    // Get orders by merchant
    getOrdersByMerchant: async (merchantId: string): Promise<Order[]> => {
        try {
            // Business rule: 1 merchant = 1 restaurant
            const restaurantsResponse = await restaurantApi.getRestaurantByMerchantId(merchantId);
            const data = restaurantsResponse.data;
            const restaurants = Array.isArray(data) ? data : data ? [data] : [];

            const firstRestaurant = restaurants[0] as { id?: string; _id?: string } | undefined;
            const restaurantId = firstRestaurant?.id || firstRestaurant?._id;

            if (!restaurantId) return [];

            const { orders } = await orderApi.getOrdersByRestaurant(restaurantId, merchantId);

            return orders.sort((a: Order, b: Order) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });
        } catch (error) {
            console.error("Failed to get orders by merchant:", error);
            return [];
        }
    },

    // Update order status
    updateOrderStatus: async (
        orderId: string,
        status: OrderStatus,
        options?: {
            cancellationReason?: string;
        }
    ) => {
        const payload: { status: OrderStatus; cancellationReason?: string } = { status };

        if (status === OrderStatus.CANCELLED) {
            if (!options?.cancellationReason?.trim()) {
                throw new Error("cancellationReason is required when status is cancelled");
            }
            payload.cancellationReason = options.cancellationReason.trim();
        }

        const response = await api.patch(`/orders/${orderId}/status`, payload, withOrderServiceBase());
        return response.data;
    },

    // Cancel order - uses dedicated /cancel endpoint
    cancelOrder: async (orderId: string, reason: string) => {
        if (!reason?.trim()) {
            throw new Error("Cancellation reason is required");
        }
        const response = await api.patch<{ success: boolean; message: string; data: Order }>(
            `/orders/${orderId}/cancel`,
            { reason: reason.trim() },
            withOrderServiceBase(),
        );
        return response.data.data;
    },

    // Merchant: Accept order
    acceptOrder: async (orderId: string): Promise<Order> => {
        const response = await api.post<{ success: boolean; data: Order }>(
            `/merchant/orders/${orderId}/accept`,
            undefined,
            withOrderServiceBase(),
        );
        return response.data.data;
    },

    // Merchant: Reject order
    rejectOrder: async (orderId: string, reason: string): Promise<Order> => {
        const response = await api.post<{ success: boolean; data: Order }>(
            `/merchant/orders/${orderId}/reject`,
            {
                reason,
            },
            withOrderServiceBase(),
        );
        return response.data.data;
    },

    // Merchant: Get restaurant orders
    getRestaurantOrders: async (
        restaurantId: string,
        filters?: { status?: string; page?: number; limit?: number }
    ): Promise<{ orders: Order[]; pagination?: Pagination }> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());

        const response = await api.get<{ success: boolean; data: Order[]; pagination?: Pagination }>(
            `/merchant/orders/restaurants/${restaurantId}/orders${params.toString() ? `?${params.toString()}` : ""}`,
            withOrderServiceBase(),
        );
        return {
            orders: response.data.data,
            pagination: response.data.pagination,
        };
    },
};
