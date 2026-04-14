export interface ApiSuccessResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// ===================== ADMIN DASHBOARD =====================

export interface AdminSystemOverview {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completedOrders: number;
    cancelledOrders: number;
    totalMerchants: number;
    totalRestaurants: number;
    totalUsers: number;
    completionRate: string | number;
}

export interface AdminPlatformTrendPoint {
    date: string;
    totalOrders: number;
    totalRevenue: number;
    activeMerchants: number;
    activeUsers: number;
}

export interface AdminTopMerchant {
    rank: number;
    merchantId: string;
    performanceScore: number;
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    successRate: number;
    averageRating: number;
    totalRatings: number;
    repeatOrderRate: number;
    averageOrderValue: number;
}

export interface AdminMerchantPerformance {
    merchantId: string;
    restaurantId: string;
    restaurantName: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completedOrders: number;
    cancelledOrders: number;
    completionRate: string | number;
}

export interface AdminRevenueAnalytics {
    totalRevenue: number;
    totalProductAmount: number;
    totalDeliveryFee: number;
    totalTax: number;
    totalDiscount: number;
    totalOrders: number;
    averageOrderValue: number;
}

export interface AdminOrderStatistics {
    statusBreakdown: Array<{ status: string; count: number; totalAmount: number }>;
    paymentBreakdown: Array<{ paymentStatus: string; count: number; totalAmount: number }>;
}

export interface AdminRevenueByMerchant {
    merchantId: string;
    totalRevenue: number;
    totalOrders: number;
    totalProductAmount: number;
    totalDeliveryFee: number;
    totalTax: number;
    totalDiscount: number;
    averageOrderValue: number;
}

// ===================== MERCHANT DASHBOARD =====================

export interface MerchantOrderOverview {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    confirmedOrders: number;
    preparingOrders: number;
    readyOrders: number;
    completedOrders: number;
    cancelledOrders: number;
}

export interface MerchantRevenueTrendPoint {
    date: string;
    totalOrders: number;
    totalRevenue: number;
}

export interface MerchantRevenueAnalytics {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueByRestaurant: Array<{
        restaurantId: string;
        restaurantName: string;
        totalOrders: number;
        totalRevenue: number;
        totalProductAmount: number;
        totalDeliveryFee: number;
        totalTax: number;
        totalDiscount: number;
        averageOrderValue: number;
    }>;
}

export interface MerchantTopProduct {
    productId: string;
    productName: string;
    imageURL?: string | null;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
}

export interface MerchantRatingStats {
    totalRatings: number;
    averageRating: number;
    ratingDistribution: Record<"1" | "2" | "3" | "4" | "5", number> | Record<number, number>;
}

export interface MerchantRestaurantOverview {
    restaurantId: string;
    restaurantName: string;
    restaurantSlug: string;
    restaurantEnabled: boolean;
    totalProducts: number;
    rating: number;
    totalReviews: number;
    address: string;
    imageURL?: string | null;
    openingTime?: string | null;
    closingTime?: string | null;
}

export interface MerchantHourlyStatistic {
    hour: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export interface MerchantTimeBasedAnalytics {
    weekdayStatistics: Array<{
        dayOfWeek: number;
        dayName: string;
        totalOrders: number;
        totalRevenue: number;
    }>;
    peakHour: { hour: number; totalOrders: number; totalRevenue: number };
    busiestDay: { dayName: string; totalOrders: number; totalRevenue: number };
}

// ===================== DASHBOARD SERVICE V2 =====================

export type DashboardPeriod = "day" | "week" | "month";

export interface DashboardOverviewResponse {
    revenueToday: number;
    revenueThisMonth: number;
    ordersToday: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
}

export interface DashboardRevenueByDate {
    date: string;
    revenue: number;
    orderCount: number;
}

export interface DashboardRevenueResponse {
    totalRevenue: number;
    totalOrders: number;
    breakdown: DashboardRevenueByDate[];
}

export interface DashboardRevenueCompareResponse {
    current: DashboardRevenueResponse;
    previous: DashboardRevenueResponse;
    revenueGrowthPercent: number;
    orderGrowthPercent: number;
}

export interface DashboardOrderStatusResponse {
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    delivering: number;
    completed: number;
    cancelled: number;
}

export interface DashboardHourlyOrderResponse {
    hour: number;
    orderCount: number;
}

export interface DashboardTopProductItem {
    productId: string;
    productName: string;
    sizeName?: string | null;
    totalQuantitySold: number;
    totalRevenue: number;
}

export interface DashboardTopProductsResponse {
    items: DashboardTopProductItem[];
}

export interface DashboardRevenueByRestaurantItem {
    restaurantId: string;
    restaurantName: string;
    revenue: number;
    orderCount: number;
}

export interface DashboardRevenueByRestaurantResponse {
    items: DashboardRevenueByRestaurantItem[];
}

export interface UserAdminStatsOverviewResponse {
    totalUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
}

export interface RestaurantAdminStatsResponse {
    totalRestaurants: number;
    totalProducts: number;
    totalCategories: number;
    averageRating: number;
}

export interface DashboardOrderSummary {
    id: string;
    orderCode?: number | null;
    userId?: string;
    restaurantId?: string;
    restaurantName?: string;
    totalPrice: number;
    status: string;
    paymentStatus?: string;
    createdAt: string;
    itemCount?: number;
}
