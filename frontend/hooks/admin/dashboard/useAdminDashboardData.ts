import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    adaptAdminMerchantsPerformanceToViewModel,
    adaptAdminOrderStatisticsToViewModel,
    adaptAdminRevenueByMerchantToViewModel,
    adaptAdminSystemOverviewToViewModel,
} from "@/lib/adapters/dashboardAdapters";
import { buildDateRangeQuery, dashboardApi, type DashboardDateRangePreset } from "@/lib/api/dashboardApi";
import { orderApi } from "@/lib/api/orderApi";
import type { Order } from "@/types/order.type";
import type { DashboardApiBundle } from "@/components/dashboard/DashboardVisualization";

export interface DashboardStats {
    activeUsers: number;
    activeMerchants: number;
    totalRestaurants: number;
    activeRestaurants: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    completionRate: number | string;
    pendingMerchants: number;
}

export interface RevenueBreakdownData {
    totalProductAmount: number;
    totalDeliveryFee: number;
    totalTax: number;
    totalDiscount: number;
}

export interface BreakdownItem {
    name: string;
    count: number;
    amount: number;
}

export interface MerchantPerformanceItem {
    merchantId: string;
    restaurantName: string;
    revenue: number;
    orders: number;
    completionRate: number | string;
}

export function useAdminDashboardData() {
    const [rangePreset, setRangePreset] = useState<DashboardDateRangePreset>("30d");
    const dateQuery = useMemo(() => buildDateRangeQuery(rangePreset), [rangePreset]);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdownData | null>(null);
    const [statusBreakdown, setStatusBreakdown] = useState<BreakdownItem[]>([]);
    const [paymentBreakdown, setPaymentBreakdown] = useState<BreakdownItem[]>([]);
    const [merchantPerformance, setMerchantPerformance] = useState<MerchantPerformanceItem[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [vizData, setVizData] = useState<DashboardApiBundle | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [overview, revenue, orderStats, merchants, revenueByMerch] = await Promise.all([
                dashboardApi.getAdminOverview(dateQuery),
                dashboardApi.getAdminRevenueAnalytics(dateQuery),
                dashboardApi.getAdminOrderStatistics(dateQuery),
                dashboardApi.getAdminMerchantsPerformance(dateQuery),
                dashboardApi.getAdminRevenueByMerchant(dateQuery),
            ]);

            setVizData({
                overview: { success: true, data: overview },
                revenue: { success: true, data: revenue },
                orders: {
                    success: true,
                    data: {
                        statusBreakdown: Array.isArray(orderStats?.statusBreakdown) ? orderStats.statusBreakdown : [],
                    },
                },
                merchants: {
                    success: true,
                    data: Array.isArray(merchants) ? merchants : [],
                },
            });

            setStats({
                ...adaptAdminSystemOverviewToViewModel(overview),
                pendingMerchants: 0,
            });
            setRevenueBreakdown(revenue);

            const { statusBreakdown: st, paymentBreakdown: pay } = adaptAdminOrderStatisticsToViewModel(orderStats);
            setStatusBreakdown(st);
            setPaymentBreakdown(pay);

            setMerchantPerformance(adaptAdminMerchantsPerformanceToViewModel(merchants));
            void adaptAdminRevenueByMerchantToViewModel(revenueByMerch);

            const recent = await orderApi.getAllOrders({ page: 1, limit: 5 });
            setRecentOrders(Array.isArray(recent.orders) ? recent.orders : []);
        } catch (error) {
            console.error("Failed to load admin dashboard:", error);
            toast.error("Unable to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, [dateQuery]);

    useEffect(() => {
        fetchData().catch(() => {});
    }, [fetchData]);

    return {
        rangePreset,
        setRangePreset,
        loading,
        stats,
        revenueBreakdown,
        statusBreakdown,
        paymentBreakdown,
        merchantPerformance,
        recentOrders,
        vizData,
    };
}
