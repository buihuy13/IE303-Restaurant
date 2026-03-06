"use client";

import {
    BarChart3,
    CheckCircle2,
    DollarSign,
    ShoppingCart,
    Store,
    Users,
} from "lucide-react";
import { useMemo } from "react";
import DashboardVisualization from "@/components/dashboard/DashboardVisualization";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardRevenueBreakdown } from "@/components/dashboard/DashboardRevenueBreakdown";
import { DashboardOrderStatusSection } from "@/components/dashboard/DashboardOrderStatusSection";
import { DashboardPaymentStatusSection } from "@/components/dashboard/DashboardPaymentStatusSection";
import { DashboardTopMerchants } from "@/components/dashboard/DashboardTopMerchants";
import { DashboardRecentOrders } from "@/components/dashboard/DashboardRecentOrders";
import { useAdminDashboardData } from "@/hooks/admin/dashboard/useAdminDashboardData";
import { formatCurrency, safeToFixed } from "@/lib/utils/dashboardFormat";

export default function DashboardPageClient() {
    const {
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
    } = useAdminDashboardData();

    const cards = useMemo(() => {
        return [
            {
                title: "Total Revenue",
                value: formatCurrency(stats?.totalRevenue ?? 0),
                icon: DollarSign,
                bgColor: "bg-meta-3/10",
                iconColor: "text-meta-3",
                trend: 12.5,
                trendLabel: "vs last month",
            },
            {
                title: "Total Orders",
                value: stats?.totalOrders ?? 0,
                icon: ShoppingCart,
                bgColor: "bg-primary/10",
                iconColor: "text-primary",
                trend: 8.2,
                trendLabel: "vs last month",
            },
            {
                title: "Users",
                value: stats?.activeUsers ?? 0,
                icon: Users,
                bgColor: "bg-meta-6/10",
                iconColor: "text-meta-6",
                trend: 3.7,
                trendLabel: "new users",
            },
            {
                title: "Restaurants",
                value: `${stats?.activeRestaurants ?? 0}/${stats?.totalRestaurants ?? 0}`,
                icon: Store,
                bgColor: "bg-warning/10",
                iconColor: "text-warning",
                trend: undefined,
                trendLabel: "active",
            },
            {
                title: "Avg Order Value",
                value: formatCurrency(stats?.averageOrderValue ?? 0),
                icon: BarChart3,
                bgColor: "bg-meta-5/10",
                iconColor: "text-meta-5",
            },
            {
                title: "Completion Rate",
                value: stats ? `${safeToFixed(stats.completionRate)}%` : "0%",
                icon: CheckCircle2,
                bgColor: "bg-success/10",
                iconColor: "text-success",
            },
        ];
    }, [stats]);

    return (
        <div className="space-y-6">
            <DashboardHeader rangePreset={rangePreset} onRangeChange={setRangePreset} />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                {cards.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {vizData && <DashboardVisualization data={vizData} />}

            <DashboardRevenueBreakdown data={revenueBreakdown} />

            <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
                <DashboardOrderStatusSection items={statusBreakdown} />
                <DashboardPaymentStatusSection items={paymentBreakdown} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
                <DashboardTopMerchants items={merchantPerformance} />
                <DashboardRecentOrders orders={recentOrders} loading={loading} />
            </div>
        </div>
    );
}
