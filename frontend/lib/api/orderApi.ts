import { Order, OrderStatus } from "@/types/order.type";
import { AxiosError } from "axios";
import api, { getApiBaseUrl } from "../axios";
import { restaurantApi } from "./restaurantApi";
import { withOrderServiceBase } from "./serviceBaseConfig";

/** Forces gateway base URL at request time (matches `NEXT_PUBLIC_API_URL` / `API_INTERNAL_URL` on SSR). */
function withOrderApiBaseUrl() {
    return { ...withOrderServiceBase(), baseURL: getApiBaseUrl() };
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const idStr = (v: unknown): string => (v == null || v === "" ? "" : String(v));

const numUnknown = (v: unknown): number => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

/** order-service `OrderStatus` enum (no READY): map UI READY → DELIVERING for writes. */
const toBackendOrderStatus = (status: string): string => {
    const normalized = status.trim().toLowerCase();
    if (normalized === OrderStatus.READY) return "DELIVERING";
    return status.trim().toUpperCase();
};

const normalizePaymentStatusForOrder = (raw: string): Order["paymentStatus"] => {
    const lower = raw.trim().toLowerCase();
    if (lower === "unpaid") return "pending";
    if (lower === "paid") return "paid";
    if (lower === "failed") return "failed";
    const allowed: Order["paymentStatus"][] = ["pending", "paid", "completed", "failed", "refunded"];
    if (allowed.includes(lower as Order["paymentStatus"])) {
        return lower as Order["paymentStatus"];
    }
    return "pending";
};
const ORDER_BASE_PATH = "/order";

/** Loose UUID v1–v5 (backend / gateway may use any version). */
const UUID_STRING_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuidString(value: string): boolean {
    return UUID_STRING_REGEX.test(value.trim());
}

/**
 * Canonical UUID string for PayOS / API paths (adds hyphens to compact hex if needed).
 */
function normalizeUuidLikeForPayment(value: string): string {
    const t = value.trim();
    if (!t) return "";
    if (isUuidString(t)) return t;
    const compact = t.replace(/-/g, "");
    if (/^[0-9a-f]{32}$/i.test(compact)) {
        return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
    }
    return "";
}

function parseJsonIfNeeded(body: unknown): unknown {
    if (typeof body !== "string") {
        return body;
    }
    const t = body.trim();
    if (!t) {
        return body;
    }
    try {
        return JSON.parse(t) as unknown;
    } catch {
        return body;
    }
}

/**
 * API gateway sometimes returns JSON as a string (sometimes nested), e.g. `data: "[{...}]"`.
 */
function unwrapJsonValue(value: unknown, maxDepth = 10): unknown {
    let v: unknown = value;
    for (let i = 0; i < maxDepth; i++) {
        if (typeof v !== "string") {
            return v;
        }
        const next = parseJsonIfNeeded(v);
        if (next === v) {
            return v;
        }
        v = next;
    }
    return v;
}

/** `id` from Jackson is usually a string; Mongo / some gateways may use `$uuid` or nested forms. */
function coerceOrderUuidFromUnknown(v: unknown): string {
    if (v == null) return "";
    if (typeof v === "string") {
        return normalizeUuidLikeForPayment(v);
    }
    if (typeof v === "object" && !Array.isArray(v)) {
        const o = v as Record<string, unknown>;
        if (typeof o.$uuid === "string") {
            return normalizeUuidLikeForPayment(o.$uuid);
        }
        if (typeof o.uuid === "string") {
            return normalizeUuidLikeForPayment(o.uuid);
        }
    }
    return "";
}

/** Last resort: first `"id"|"orderId"` + UUID in JSON text. */
function extractOrderUuidFromJsonString(json: unknown): string {
    if (json == null) return "";
    let s: string;
    try {
        s = typeof json === "string" ? json : JSON.stringify(json);
    } catch {
        return "";
    }
    const re =
        /"(?:id|orderId)"\s*:\s*"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"/i;
    const m = re.exec(s);
    return m ? normalizeUuidLikeForPayment(m[1]) : "";
}

function getCheckoutPostUrl(): string {
    return `${String(getApiBaseUrl()).replace(/\/$/, "")}${ORDER_BASE_PATH}/checkout`;
}

/**
 * Pull order id from order-like objects and common gateway shells. Does not recurse into `items`
 * (line items contain product UUIDs).
 */
function extractOrderIdFromOrderShape(obj: unknown, depth = 0): string {
    if (depth > 12 || !obj || typeof obj !== "object") {
        return "";
    }
    const r = obj as Record<string, unknown>;
    const direct =
        coerceOrderUuidFromUnknown(r.orderId) ||
        coerceOrderUuidFromUnknown(r.id) ||
        normalizeUuidLikeForPayment(idStr((r as { order_id?: unknown }).order_id).trim()) ||
        normalizeUuidLikeForPayment(idStr((r as { OrderId?: unknown }).OrderId).trim()) ||
        normalizeUuidLikeForPayment(idStr((r as { orderID?: unknown }).orderID).trim());
    const normalizedDirect = direct;
    if (normalizedDirect) {
        return normalizedDirect;
    }

    const nestKeys = [
        "order",
        "data",
        "payload",
        "result",
        "entity",
        "body",
        "value",
        "record",
        "orderResponse",
        "orderData",
    ] as const;
    for (const k of nestKeys) {
        const inner = r[k];
        if (inner && typeof inner === "object" && !Array.isArray(inner)) {
            const hit = extractOrderIdFromOrderShape(inner, depth + 1);
            if (hit) {
                return hit;
            }
        }
    }
    return "";
}

/**
 * Deep scan of checkout HTTP body for an `order-service` OrderResponse (totalPrice, orderCode, …)
 * and a parseable order UUID. Skips `items` subtrees to avoid picking product UUIDs.
 */
function findOrderIdInCheckoutResponse(body: unknown, depth = 0): string {
    if (depth > 14 || body == null || typeof body !== "object") {
        return "";
    }
    if (Array.isArray(body)) {
        for (const el of body) {
            const hit = findOrderIdInCheckoutResponse(el, depth + 1);
            if (hit) return hit;
        }
        return "";
    }
    const r = body as Record<string, unknown>;
    const totalPrice = r.totalPrice;
    const hasTotalPrice =
        typeof totalPrice === "number" ||
        (typeof totalPrice === "string" && String(totalPrice).trim() !== "");
    const hasOrderCode = r.orderCode !== undefined && r.orderCode !== null;
    const hasItems = Array.isArray(r.items);
    // Real orders include customer + restaurant; avoids matching `{ id, name, items }` restaurant DTOs.
    const looksLikeOrderResponse =
        r.userId !== undefined &&
        r.restaurantId !== undefined &&
        (hasItems ||
            hasTotalPrice ||
            hasOrderCode ||
            typeof r.deliveryAddress === "string" ||
            (r.deliveryAddress !== null && typeof r.deliveryAddress === "object") ||
            typeof r.note === "string" ||
            typeof r.restaurantName === "string" ||
            (r.status !== undefined && r.paymentStatus !== undefined));

    if (looksLikeOrderResponse) {
        const canon =
            coerceOrderUuidFromUnknown(r.id) ||
            normalizeUuidLikeForPayment(idStr(r.orderId).trim()) ||
            normalizeUuidLikeForPayment(idStr((r as { _id?: unknown })._id).trim());
        if (canon) return canon;
    }

    for (const [k, v] of Object.entries(r)) {
        if (k === "items" && Array.isArray(v)) {
            continue;
        }
        if (v && typeof v === "object") {
            const hit = findOrderIdInCheckoutResponse(v, depth + 1);
            if (hit) return hit;
        }
    }
    return "";
}

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

    const orderId =
        idStr(r.orderId) ||
        coerceOrderUuidFromUnknown(r.id) ||
        idStr((r as { Id?: unknown }).Id) ||
        idStr(r._id) ||
        idStr((r as { order_id?: unknown }).order_id);
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
                  sizeId: idStr(i.productSizeId ?? i.sizeId) || undefined,
                  sizeName:
                      typeof i.sizeName === "string"
                          ? i.sizeName
                          : typeof i.size_name === "string"
                            ? i.size_name
                            : undefined,
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
        num(r.finalAmount) ||
        num(r.totalAmount) ||
        num(r.totalPrice) ||
        items.reduce((s, it) => s + it.price * it.quantity, 0);

    const statusRaw = typeof r.status === "string" ? r.status : String(r.status ?? "");
    const statusLower = statusRaw.toLowerCase();
    const allowed = new Set<string>(Object.values(OrderStatus));
    const status = (allowed.has(statusLower) ? statusLower : OrderStatus.PENDING) as Order["status"];

    const paymentStatusRaw =
        typeof r.paymentStatus === "string" ? r.paymentStatus : String(r.paymentStatus ?? "");
    const paymentStatus = normalizePaymentStatusForOrder(paymentStatusRaw);

    const orderCodeNum = num(r.orderCode);
    const orderCode = orderCodeNum > 0 ? orderCodeNum : undefined;

    let deliveryAddress = { street: "", city: "", state: "", zipCode: "" };
    if (r.deliveryAddress && typeof r.deliveryAddress === "object") {
        const d = r.deliveryAddress as Record<string, unknown>;
        deliveryAddress = {
            street: typeof d.street === "string" ? d.street : "",
            city: typeof d.city === "string" ? d.city : "",
            state: typeof d.state === "string" ? d.state : "",
            zipCode: typeof d.zipCode === "string" ? d.zipCode : typeof d.zip_code === "string" ? d.zip_code : "",
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
    const paymentMethod: Order["paymentMethod"] = pm === "cash" || pm === "wallet" || pm === "card" ? pm : "card";

    return {
        orderId,
        ...(orderCode !== undefined ? { orderCode } : {}),
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
        paymentStatus,
        orderNote: typeof r.orderNote === "string" ? r.orderNote : typeof r.note === "string" ? r.note : undefined,
        createdAt,
        updatedAt,
    };
}

function parseUserOrdersPayload(body: unknown): { orders: Order[]; pagination?: unknown } {
    const root = unwrapJsonValue(parseJsonIfNeeded(body));
    if (root == null) {
        return { orders: [] };
    }
    if (Array.isArray(root)) {
        return { orders: root.map(normalizeOrderDto) };
    }
    if (typeof root !== "object") {
        return { orders: [] };
    }
    const b = root as Record<string, unknown>;
    const inner: unknown = b.data !== undefined ? unwrapJsonValue(b.data) : b;

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
        if (Array.isArray(obj.list)) {
            return {
                orders: obj.list.map(normalizeOrderDto),
                pagination: obj.pagination,
            };
        }
        if (Array.isArray(obj.results)) {
            return {
                orders: obj.results.map(normalizeOrderDto),
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

function unwrapOrderPayload(body: unknown): unknown {
    if (body == null || typeof body !== "object") {
        return body;
    }
    const record = body as Record<string, unknown>;
    if ("data" in record) {
        return record.data;
    }
    return body;
}

/**
 * Checkout may return `OrderResponse[]` directly or wrapped by gateway (`data`, nested `data`, `orders`, `content`).
 * Some gateways return a single `OrderResponse` object (not an array) under `data`.
 */
function unwrapCheckoutOrderList(body: unknown): unknown[] {
    const parsed = unwrapJsonValue(parseJsonIfNeeded(body));
    if (parsed == null) {
        return [];
    }
    let cur: unknown = parsed;
    for (let depth = 0; depth < 10; depth++) {
        cur = unwrapJsonValue(cur);
        if (Array.isArray(cur)) {
            return cur;
        }
        if (!cur || typeof cur !== "object") {
            return [];
        }
        const rec = cur as Record<string, unknown>;
        if (Array.isArray(rec.orders)) {
            return rec.orders;
        }
        if (Array.isArray(rec.list)) {
            return rec.list;
        }
        if (Array.isArray(rec.results)) {
            return rec.results;
        }
        if (Array.isArray(rec.content)) {
            return rec.content;
        }
        const next = rec.data ?? rec.payload ?? rec.result ?? rec.body ?? rec.value;
        if (next !== undefined && next !== null) {
            cur = unwrapJsonValue(next);
            continue;
        }
        // Single order object: require an id-like field (not only restaurantId — partial DTOs had no id).
        if (idStr(rec.id) || idStr(rec.orderId) || idStr((rec as { _id?: unknown })._id)) {
            return [cur];
        }
        return [];
    }
    return [];
}

/**
 * After checkout, if the response omits parseable ids, load the latest user orders and pick by restaurant.
 */
async function fetchOrderIdAfterCheckoutFallback(userId: string, restaurantId: string): Promise<string> {
    const uid = userId.trim();
    const rid = restaurantId.trim().toLowerCase();
    if (!uid || !rid) {
        return "";
    }
    const query = new URLSearchParams();
    query.set("page", "0");
    query.set("size", "20");
    const url = `${ORDER_BASE_PATH}?${query.toString()}`;

    for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
            await sleep(350 * attempt);
        }
        try {
            const listRes = await api.get<unknown>(url, withOrderApiBaseUrl());
            const rawBody = parseJsonIfNeeded(listRes.data);
            const fromDeepList = findOrderIdInCheckoutResponse(rawBody);
            if (fromDeepList) {
                return fromDeepList;
            }
            const fromRegex = extractOrderUuidFromJsonString(rawBody);
            if (fromRegex) {
                return fromRegex;
            }
            const parsed = parseUserOrdersPayload(rawBody);

            const match = parsed.orders.find(
                (o) => (o.restaurantId || o.restaurant?.id || "").toLowerCase() === rid,
            );
            const pick = match ?? parsed.orders[0];
            const fromDto = pick?.orderId?.trim();
            if (fromDto) {
                return normalizeUuidLikeForPayment(fromDto) || fromDto;
            }

            const rawList = unwrapCheckoutOrderList(rawBody);
            for (const row of rawList) {
                const extracted = extractOrderIdFromOrderShape(row);
                if (extracted) {
                    return extracted;
                }
            }
        } catch {
            /* retry */
        }
    }
    return "";
}

function parseSingleOrderPayload(body: unknown): Order {
    const payload = unwrapOrderPayload(body);
    return normalizeOrderDto(payload);
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
        const encodedOrderId = encodeURIComponent(orderId.trim());
        const url = cacheBust
            ? `${ORDER_BASE_PATH}/${encodedOrderId}?t=${Date.now()}`
            : `${ORDER_BASE_PATH}/${encodedOrderId}`;
        const response = await api.get<unknown>(url, withOrderApiBaseUrl());
        return parseSingleOrderPayload(response.data);
    },

    // Public: Get an order by slug
    getOrderBySlug: async (slug: string, options?: { cacheBust?: boolean }): Promise<Order> => {
        // New gateway contract does not expose slug endpoint.
        // Client routes currently use orderId as slug, so resolve by ID.
        return orderApi.getOrderById(slug, options);
    },

    // Create new order
    createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
        try {
            const payload = {
                restaurantIds: [orderData.restaurantId],
                deliveryAddress: orderData.deliveryAddress.street,
                note: orderData.orderNote,
            };

            if (process.env.NODE_ENV === "development") {
                console.info("[orderApi] POST checkout →", getCheckoutPostUrl(), "(Network: xóa filter, tìm `checkout`)");
            }
            const response = await api.post<unknown>(`${ORDER_BASE_PATH}/checkout`, payload, withOrderApiBaseUrl());
            const checkoutBody = parseJsonIfNeeded(response.data);
            if (typeof checkoutBody === "string" && checkoutBody.trim().startsWith("<")) {
                throw new Error(
                    "Checkout nhận HTML thay vì JSON. Kiểm tra NEXT_PUBLIC_API_URL trỏ tới API gateway (ví dụ http://localhost:8080/api).",
                );
            }
            const list = unwrapCheckoutOrderList(checkoutBody);

            if (list.length === 0) {
                const fromRegexEmpty = extractOrderUuidFromJsonString(checkoutBody);
                if (fromRegexEmpty) {
                    return orderApi.getOrderById(fromRegexEmpty);
                }
                const fromDeepEmpty = findOrderIdInCheckoutResponse(checkoutBody);
                if (fromDeepEmpty) {
                    return orderApi.getOrderById(fromDeepEmpty);
                }
                const recoveredEmpty = await fetchOrderIdAfterCheckoutFallback(
                    orderData.userId,
                    orderData.restaurantId,
                );
                if (recoveredEmpty) {
                    return orderApi.getOrderById(recoveredEmpty);
                }
                throw new Error("Order service returned empty checkout result");
            }

            const ridTarget = orderData.restaurantId.trim().toLowerCase();
            const matched =
                list.find((item) => {
                    if (!item || typeof item !== "object") return false;
                    const record = item as Record<string, unknown>;
                    return idStr(record.restaurantId).toLowerCase() === ridTarget;
                }) ?? list[0];

            const matchedObj =
                typeof matched === "string" ? unwrapJsonValue(parseJsonIfNeeded(matched)) : matched;
            const normalized = normalizeOrderDto(matchedObj);
            const raw = (matchedObj && typeof matchedObj === "object"
                ? matchedObj
                : {}) as Record<string, unknown>;
            let resolvedId =
                coerceOrderUuidFromUnknown(raw.id) ||
                extractOrderUuidFromJsonString(checkoutBody) ||
                normalizeUuidLikeForPayment(idStr(normalized.orderId).trim()) ||
                normalizeUuidLikeForPayment(idStr(raw.id).trim()) ||
                normalizeUuidLikeForPayment(idStr(raw.orderId).trim()) ||
                normalizeUuidLikeForPayment(idStr((raw as { order_id?: unknown }).order_id).trim()) ||
                normalizeUuidLikeForPayment(idStr((raw as { OrderId?: unknown }).OrderId).trim()) ||
                normalizeUuidLikeForPayment(idStr((raw as { Id?: unknown }).Id).trim()) ||
                normalizeUuidLikeForPayment(idStr(normalized.slug).trim()) ||
                extractOrderIdFromOrderShape(matched) ||
                extractOrderIdFromOrderShape(checkoutBody) ||
                findOrderIdInCheckoutResponse(checkoutBody);

            if (!resolvedId) {
                resolvedId = await fetchOrderIdAfterCheckoutFallback(orderData.userId, orderData.restaurantId);
            }

            if (!resolvedId?.trim()) {
                if (process.env.NODE_ENV === "development") {
                    const data = response.data;
                    let preview = "";
                    try {
                        preview =
                            typeof data === "string"
                                ? data.slice(0, 500)
                                : JSON.stringify(data).slice(0, 500);
                    } catch {
                        preview = String(data);
                    }
                    console.warn("[orderApi] Checkout HTTP OK nhưng không parse được order id.", {
                        url: getCheckoutPostUrl(),
                        status: response.status,
                        bodyPreview: preview,
                    });
                }
                throw new Error(
                    "Không đọc được mã đơn từ phản hồi. Kiểm tra NEXT_PUBLIC_API_URL (vd. http://localhost:8080/api). Trong tab Network: xóa hết ô lọc/filter, gõ checkout hoặc chọn All — phải thấy POST …/order/checkout. Xem thêm log [orderApi] trong Console.",
                );
            }
            const finalId =
                normalizeUuidLikeForPayment(resolvedId.trim()) || resolvedId.trim();
            return {
                ...normalized,
                orderId: finalId,
                slug: (normalized.slug && normalized.slug.trim()) || finalId,
            };
        } catch (error: unknown) {
            const status =
                error instanceof AxiosError
                    ? error.response?.status
                    : (error as { response?: { status?: number } })?.response?.status;
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
                    `Restaurant "${restaurantName}" is currently closed. Please check its operating hours and try again later.`,
                );
            }

            if (status === 400) {
                throw new Error("Invalid checkout request. Please refresh your cart and try again.");
            }

            if (status === 404) {
                throw new Error("Restaurant or cart data is no longer available. Please refresh and try again.");
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
        }>(`/orders${search.toString() ? `?${search.toString()}` : ""}`, withOrderApiBaseUrl());

        return {
            orders: response.data.data.orders,
            pagination: response.data.data.pagination,
        };
    },

    // Admin API (new order-service contract): GET /api/orders/admin
    getAdminOrders: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{ orders: Order[]; pagination?: Pagination }> => {
        const search = new URLSearchParams();
        const pageIndex = Math.max((params?.page ?? 1) - 1, 0);
        search.append("page", String(pageIndex));
        search.append("size", String(params?.limit ?? 10));
        if (params?.status?.trim()) {
            search.append("status", toBackendOrderStatus(params.status));
        }

        const response = await api.get<unknown>(`/orders/admin?${search.toString()}`, withOrderApiBaseUrl());
        const payload = (response.data ?? {}) as Record<string, unknown>;
        const content = Array.isArray(payload.content) ? payload.content : [];

        return {
            orders: content.map(normalizeOrderDto),
            pagination: {
                page: numUnknown(payload.number) + 1,
                limit: numUnknown(payload.size),
                total: numUnknown(payload.totalElements),
                totalPages: numUnknown(payload.totalPages),
            },
        };
    },

    // Get orders by restaurant (Manager/Merchant)
    getOrdersByRestaurant: async (
        restaurantId: string,
        merchantId?: string,
        filters?: { status?: string; page?: number; limit?: number },
    ): Promise<{ orders: Order[]; pagination?: Pagination }> => {
        void merchantId;
        const params = new URLSearchParams();
        if (filters?.page) params.append("page", String(Math.max(filters.page - 1, 0)));
        if (filters?.limit) params.append("size", String(filters.limit));
        if (filters?.status?.trim()) params.append("status", toBackendOrderStatus(filters.status));

        try {
            const encodedRestaurantId = encodeURIComponent(restaurantId.trim());
            const response = await api.get<unknown>(
                `${ORDER_BASE_PATH}/restaurant/${encodedRestaurantId}${params.toString() ? `?${params.toString()}` : ""}`,
                withOrderApiBaseUrl(),
            );
            const rawPayload = unwrapOrderPayload(response.data);
            const rawOrders = Array.isArray(rawPayload) ? rawPayload : [];

            return {
                orders: rawOrders.map(normalizeOrderDto),
                pagination: undefined,
            };
        } catch (error: unknown) {
            console.error(`Failed to get orders for restaurant ${restaurantId}:`, error);
            // Re-throw so the caller can handle it
            throw error;
        }
    },

    /**
     * Lists orders for a user (order-service).
     * Expects: `GET /order` with body like `Order[]` (or wrapped legacy payload).
     * or Spring `Page` in `data.content`. Empty list on HTTP 404.
     *
     * Backend / gateway checklist (see team notes if calls fail):
     * - api-gateway must route `/api/cart/**` and `/api/order/**` to `order-service`.
     * - order-service should expose this route and return DTO fields compatible with `normalizeOrderDto`.
     */
    getOrdersByUser: async (
        userId: string,
        options?: { page?: number; size?: number },
    ): Promise<{ orders: Order[]; pagination?: unknown }> => {
        if (!userId?.trim()) {
            return { orders: [], pagination: undefined };
        }
        try {
            const page = Math.max(options?.page ?? 0, 0);
            const size = Math.min(Math.max(options?.size ?? 50, 1), 200);
            const query = new URLSearchParams();
            query.set("page", String(page));
            query.set("size", String(size));
            const response = await api.get<unknown>(`${ORDER_BASE_PATH}?${query.toString()}`, withOrderApiBaseUrl());
            return parseUserOrdersPayload(response.data);
        } catch (error: unknown) {
            const status =
                error instanceof AxiosError
                    ? error.response?.status
                    : (error as { response?: { status?: number } })?.response?.status;
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
        },
    ) => {
        const payload = { status: toBackendOrderStatus(status) };

        if (status === OrderStatus.CANCELLED) {
            if (!options?.cancellationReason?.trim()) {
                throw new Error("cancellationReason is required when status is cancelled");
            }
        }
        const encodedOrderId = encodeURIComponent(orderId.trim());
        const response = await api.put(
            `${ORDER_BASE_PATH}/${encodedOrderId}/status`,
            payload,
            withOrderApiBaseUrl(),
        );
        return response.data;
    },

    // Admin API (new order-service contract): PUT /api/orders/admin/{orderId}/status
    updateAdminOrderStatus: async (orderId: string, status: OrderStatus) => {
        const response = await api.put(
            `/orders/admin/${orderId}/status`,
            { status: toBackendOrderStatus(status) },
            withOrderApiBaseUrl(),
        );
        return response.data;
    },

    // Cancel order - uses dedicated /cancel endpoint
    cancelOrder: async (orderId: string, reason: string) => {
        if (!reason?.trim()) {
            throw new Error("Cancellation reason is required");
        }
        const encodedOrderId = encodeURIComponent(orderId.trim());
        const response = await api.put<unknown>(
            `${ORDER_BASE_PATH}/${encodedOrderId}/cancel`,
            undefined,
            withOrderApiBaseUrl(),
        );
        return parseSingleOrderPayload(response.data);
    },

    // Merchant: Accept order
    acceptOrder: async (orderId: string): Promise<Order> => {
        const response = await api.post<{ success: boolean; data: Order }>(
            `/merchant/orders/${orderId}/accept`,
            undefined,
            withOrderApiBaseUrl(),
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
            withOrderApiBaseUrl(),
        );
        return response.data.data;
    },

    // Merchant: Get restaurant orders
    getRestaurantOrders: async (
        restaurantId: string,
        filters?: { status?: string; page?: number; limit?: number },
    ): Promise<{ orders: Order[]; pagination?: Pagination }> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());

        const response = await api.get<{ success: boolean; data: Order[]; pagination?: Pagination }>(
            `/merchant/orders/restaurants/${restaurantId}/orders${params.toString() ? `?${params.toString()}` : ""}`,
            withOrderApiBaseUrl(),
        );
        return {
            orders: response.data.data,
            pagination: response.data.pagination,
        };
    },
};
