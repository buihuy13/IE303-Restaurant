import api from "../axios";
import type {
    DashboardHourlyOrderResponse,
    DashboardOrderStatusResponse,
    DashboardOrderSummary,
    DashboardOverviewResponse,
    DashboardPeriod,
    DashboardRevenueByRestaurantResponse,
    DashboardRevenueCompareResponse,
    DashboardRevenueResponse,
    DashboardTopProductsResponse,
    MerchantRestaurantOverview,
    RestaurantAdminStatsResponse,
    UserAdminStatsOverviewResponse,
} from "@/types/dashboard.type";

function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}

function toString(value: unknown, fallback = ""): string {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return fallback;
    return String(value);
}

function toObject(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object") return value as Record<string, unknown>;
    return {};
}

function unwrapData<T>(payload: unknown): T {
    const obj = toObject(payload);
    if ("data" in obj) {
        return obj.data as T;
    }
    return payload as T;
}

function toArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}

function toISODateOnly(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export type DashboardDateRangePreset = "7d" | "30d" | "90d" | "ytd" | "all";

export function buildDateRangeQuery(preset: DashboardDateRangePreset): { startDate?: string; endDate?: string } {
    if (preset === "all") return {};

    const now = new Date();

    if (preset === "ytd") {
        const start = new Date(now.getFullYear(), 0, 1);
        return { startDate: toISODateOnly(start), endDate: toISODateOnly(now) };
    }

    const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
    const start = new Date(now);
    start.setDate(now.getDate() - days + 1);

    return { startDate: toISODateOnly(start), endDate: toISODateOnly(now) };
}

export function presetToDashboardPeriod(preset: DashboardDateRangePreset): DashboardPeriod {
    if (preset === "7d") return "week";
    if (preset === "30d") return "month";
    if (preset === "90d") return "month";
    if (preset === "ytd") return "month";
    return "month";
}

function mapOverviewResponse(raw: unknown): DashboardOverviewResponse {
    const obj = toObject(raw);
    return {
        revenueToday: toNumber(obj.revenueToday),
        revenueThisMonth: toNumber(obj.revenueThisMonth),
        ordersToday: toNumber(obj.ordersToday),
        pendingOrders: toNumber(obj.pendingOrders),
        completedOrders: toNumber(obj.completedOrders),
        cancelledOrders: toNumber(obj.cancelledOrders),
    };
}

function mapRevenueResponse(raw: unknown): DashboardRevenueResponse {
    const obj = toObject(raw);
    return {
        totalRevenue: toNumber(obj.totalRevenue),
        totalOrders: toNumber(obj.totalOrders),
        breakdown: toArray<Record<string, unknown>>(obj.breakdown).map((point) => ({
            date: toString(point.date),
            revenue: toNumber(point.revenue),
            orderCount: toNumber(point.orderCount),
        })),
    };
}

function mapRevenueCompareResponse(raw: unknown): DashboardRevenueCompareResponse {
    const obj = toObject(raw);
    return {
        current: mapRevenueResponse(obj.current),
        previous: mapRevenueResponse(obj.previous),
        revenueGrowthPercent: toNumber(obj.revenueGrowthPercent),
        orderGrowthPercent: toNumber(obj.orderGrowthPercent),
    };
}

function mapOrderStatusResponse(raw: unknown): DashboardOrderStatusResponse {
    const obj = toObject(raw);
    return {
        total: toNumber(obj.total),
        pending: toNumber(obj.pending),
        confirmed: toNumber(obj.confirmed),
        preparing: toNumber(obj.preparing),
        delivering: toNumber(obj.delivering),
        completed: toNumber(obj.completed),
        cancelled: toNumber(obj.cancelled),
    };
}

function mapTopProductsResponse(raw: unknown): DashboardTopProductsResponse {
    const obj = toObject(raw);
    return {
        items: toArray<Record<string, unknown>>(obj.items).map((item) => ({
            productId: toString(item.productId),
            productName: toString(item.productName, "Unknown product"),
            sizeName: typeof item.sizeName === "string" ? item.sizeName : null,
            totalQuantitySold: toNumber(item.totalQuantitySold),
            totalRevenue: toNumber(item.totalRevenue),
        })),
    };
}

function mapRevenueByRestaurantResponse(raw: unknown): DashboardRevenueByRestaurantResponse {
    const obj = toObject(raw);
    return {
        items: toArray<Record<string, unknown>>(obj.items).map((item) => ({
            restaurantId: toString(item.restaurantId),
            restaurantName: toString(item.restaurantName, "Unknown restaurant"),
            revenue: toNumber(item.revenue),
            orderCount: toNumber(item.orderCount),
        })),
    };
}

function mapOrderSummary(raw: unknown): DashboardOrderSummary {
    const obj = toObject(raw);
    return {
        id: toString(obj.id),
        orderCode: toNumber(obj.orderCode, 0),
        userId: toString(obj.userId),
        restaurantId: toString(obj.restaurantId),
        restaurantName: toString(obj.restaurantName),
        totalPrice: toNumber(obj.totalPrice),
        status: toString(obj.status, "PENDING"),
        paymentStatus: toString(obj.paymentStatus, "PENDING"),
        createdAt: toString(obj.createdAt),
        itemCount: toNumber(obj.itemCount),
    };
}

function mapMerchantRestaurantOverview(raw: unknown): MerchantRestaurantOverview {
    const obj = toObject(raw);
    return {
        restaurantId: toString(obj.id),
        restaurantName: toString(obj.resName, "Restaurant"),
        restaurantSlug: toString(obj.slug),
        restaurantEnabled: Boolean(obj.enabled),
        totalProducts: toNumber(obj.totalProducts),
        rating: toNumber(obj.rating),
        totalReviews: toNumber(obj.totalReview),
        address: toString(obj.address),
        imageURL: toString(obj.imageURL) || null,
        openingTime: toString(obj.openingTime) || null,
        closingTime: toString(obj.closingTime) || null,
    };
}

function toComparePeriod(period: DashboardPeriod): "week" | "month" {
    return period === "day" ? "week" : period;
}

export const dashboardApi = {
    // ===================== ADMIN (NEW CONTRACT) =====================
    getAdminOverview: async (params?: { period?: DashboardPeriod }): Promise<DashboardOverviewResponse> => {
        const _period = params?.period;
        void _period;
        const response = await api.get<unknown>("/dashboard/overview");
        return mapOverviewResponse(unwrapData(response.data));
    },

    getAdminRevenue: async (params?: { period?: DashboardPeriod }): Promise<DashboardRevenueResponse> => {
        const response = await api.get<unknown>("/dashboard/revenue", {
            params: { period: params?.period ?? "week" },
        });
        return mapRevenueResponse(unwrapData(response.data));
    },

    getAdminRevenueCompare: async (params?: {
        period?: DashboardPeriod | "week" | "month";
    }): Promise<DashboardRevenueCompareResponse> => {
        const normalized = params?.period === "day" ? "week" : (params?.period ?? "week");
        const response = await api.get<unknown>("/dashboard/revenue/compare", {
            params: { period: normalized },
        });
        return mapRevenueCompareResponse(unwrapData(response.data));
    },

    getAdminOrderStatus: async (params?: { period?: DashboardPeriod }): Promise<DashboardOrderStatusResponse> => {
        const response = await api.get<unknown>("/dashboard/orders/status", {
            params: { period: params?.period ?? "week" },
        });
        return mapOrderStatusResponse(unwrapData(response.data));
    },

    getAdminHourlyOrders: async (params?: { date?: string }): Promise<DashboardHourlyOrderResponse[]> => {
        const response = await api.get<unknown>("/dashboard/orders/hourly", {
            params,
        });

        return toArray<Record<string, unknown>>(unwrapData(response.data)).map((row) => ({
            hour: toNumber(row.hour),
            orderCount: toNumber(row.orderCount),
        }));
    },

    getAdminRecentOrders: async (params?: { limit?: number }): Promise<DashboardOrderSummary[]> => {
        const response = await api.get<unknown>("/dashboard/orders/recent", {
            params: { limit: params?.limit ?? 10 },
        });

        return toArray<unknown>(unwrapData(response.data)).map(mapOrderSummary);
    },

    getAdminTopProducts: async (params?: {
        period?: DashboardPeriod;
        limit?: number;
    }): Promise<DashboardTopProductsResponse> => {
        const response = await api.get<unknown>("/dashboard/top-products", {
            params: {
                period: params?.period ?? "week",
                limit: params?.limit ?? 5,
            },
        });

        return mapTopProductsResponse(unwrapData(response.data));
    },

    getAdminRevenueByRestaurant: async (params?: {
        period?: DashboardPeriod;
        limit?: number;
    }): Promise<DashboardRevenueByRestaurantResponse> => {
        const response = await api.get<unknown>("/dashboard/revenue/by-restaurant", {
            params: {
                period: params?.period ?? "week",
                limit: params?.limit ?? 10,
            },
        });

        return mapRevenueByRestaurantResponse(unwrapData(response.data));
    },

    getAdminUserStatsOverview: async (): Promise<UserAdminStatsOverviewResponse> => {
        const response = await api.get<unknown>("/users/admin/stats/overview");
        const obj = toObject(unwrapData(response.data));
        return {
            totalUsers: toNumber(obj.totalUsers),
            newUsersToday: toNumber(obj.newUsersToday),
            newUsersThisWeek: toNumber(obj.newUsersThisWeek),
            newUsersThisMonth: toNumber(obj.newUsersThisMonth),
        };
    },

    getAdminRestaurantStats: async (): Promise<RestaurantAdminStatsResponse> => {
        const response = await api.get<unknown>("/restaurant/admin/stats");
        const obj = toObject(unwrapData(response.data));
        return {
            totalRestaurants: toNumber(obj.totalRestaurants),
            totalProducts: toNumber(obj.totalProducts),
            totalCategories: toNumber(obj.totalCategories),
            averageRating: toNumber(obj.averageRating),
        };
    },

    // ===================== MERCHANT (NEW CONTRACT) =====================
    getMerchantOverview: async (
        restaurantId: string,
        params?: { period?: DashboardPeriod },
    ): Promise<DashboardOverviewResponse> => {
        const _period = params?.period;
        void _period;
        const response = await api.get<unknown>("/merchant/dashboard/overview", {
            params: { restaurantId },
        });
        return mapOverviewResponse(unwrapData(response.data));
    },

    getMerchantRevenue: async (
        restaurantId: string,
        params?: { period?: DashboardPeriod },
    ): Promise<DashboardRevenueResponse> => {
        const response = await api.get<unknown>("/merchant/dashboard/revenue", {
            params: {
                restaurantId,
                period: params?.period ?? "week",
            },
        });
        return mapRevenueResponse(unwrapData(response.data));
    },

    getMerchantOrderStatus: async (
        restaurantId: string,
        params?: { period?: DashboardPeriod },
    ): Promise<DashboardOrderStatusResponse> => {
        const response = await api.get<unknown>("/merchant/dashboard/orders/status", {
            params: {
                restaurantId,
                period: params?.period ?? "week",
            },
        });
        return mapOrderStatusResponse(unwrapData(response.data));
    },

    getMerchantLiveOrders: async (restaurantId: string): Promise<DashboardOrderSummary[]> => {
        const response = await api.get<unknown>("/merchant/dashboard/orders/live", {
            params: { restaurantId },
        });

        return toArray<unknown>(unwrapData(response.data)).map(mapOrderSummary);
    },

    getMerchantTopProducts: async (
        restaurantId: string,
        params?: { period?: DashboardPeriod; limit?: number },
    ): Promise<DashboardTopProductsResponse> => {
        const response = await api.get<unknown>("/merchant/dashboard/top-products", {
            params: {
                restaurantId,
                period: params?.period ?? "week",
                limit: params?.limit ?? 5,
            },
        });

        return mapTopProductsResponse(unwrapData(response.data));
    },

    getMerchantRestaurantOverview: async (merchantId: string): Promise<MerchantRestaurantOverview> => {
        const response = await api.get<unknown>(`/restaurant/merchant/${merchantId}`);
        return mapMerchantRestaurantOverview(unwrapData(response.data));
    },

    mapPresetToPeriod: presetToDashboardPeriod,

    mapPeriodForCompare: (period: DashboardPeriod): "week" | "month" => toComparePeriod(period),
};
