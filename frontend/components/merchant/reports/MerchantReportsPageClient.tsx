"use client";

import { dashboardApi } from "@/lib/api/dashboardApi";
import { formatCurrency, formatNumber } from "@/lib/utils/dashboardFormat";
import { useAuthStore } from "@/stores/useAuthStore";
import type { DashboardPeriod } from "@/types/dashboard.type";
import { AlertCircle, BarChart3, Clock3, Package, ShoppingBag, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    Area,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

function formatChartDate(dateLike: string): string {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return dateLike;
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export default function MerchantReportsPageClient() {
    const { user } = useAuthStore();

    const [period, setPeriod] = useState<DashboardPeriod>("month");
    const [loading, setLoading] = useState(true);

    const [restaurant, setRestaurant] = useState<Awaited<ReturnType<typeof dashboardApi.getMerchantRestaurantOverview>> | null>(
        null,
    );
    const [overview, setOverview] = useState<Awaited<ReturnType<typeof dashboardApi.getMerchantOverview>> | null>(null);
    const [revenue, setRevenue] = useState<Awaited<ReturnType<typeof dashboardApi.getMerchantRevenue>> | null>(null);
    const [orderStatus, setOrderStatus] = useState<Awaited<ReturnType<typeof dashboardApi.getMerchantOrderStatus>> | null>(
        null,
    );
    const [topProducts, setTopProducts] = useState<
        Awaited<ReturnType<typeof dashboardApi.getMerchantTopProducts>>["items"]
    >([]);
    const [liveOrders, setLiveOrders] = useState<Awaited<ReturnType<typeof dashboardApi.getMerchantLiveOrders>>>([]);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const run = async () => {
            setLoading(true);
            try {
                const restaurantInfo = await dashboardApi.getMerchantRestaurantOverview(user.id);

                const [nextOverview, nextRevenue, nextOrderStatus, nextTopProducts, nextLiveOrders] =
                    await Promise.all([
                        dashboardApi.getMerchantOverview(restaurantInfo.restaurantId, { period }),
                        dashboardApi.getMerchantRevenue(restaurantInfo.restaurantId, { period }),
                        dashboardApi.getMerchantOrderStatus(restaurantInfo.restaurantId, { period }),
                        dashboardApi.getMerchantTopProducts(restaurantInfo.restaurantId, { period, limit: 8 }),
                        dashboardApi.getMerchantLiveOrders(restaurantInfo.restaurantId),
                    ]);

                setRestaurant(restaurantInfo);
                setOverview(nextOverview);
                setRevenue(nextRevenue);
                setOrderStatus(nextOrderStatus);
                setTopProducts(nextTopProducts.items);
                setLiveOrders(nextLiveOrders);
            } catch (error: unknown) {
                const status =
                    error && typeof error === "object" && "response" in error
                        ? (error as { response?: { status?: number } }).response?.status
                        : undefined;

                if (status === 404) {
                    setRestaurant(null);
                    setOverview(null);
                    setRevenue(null);
                    setOrderStatus(null);
                    setTopProducts([]);
                    setLiveOrders([]);
                    return;
                }

                console.error("Failed to load merchant reports", error);
                toast.error("Unable to load report data.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [period, user?.id]);

    const revenueSeries = useMemo(
        () =>
            (revenue?.breakdown ?? []).map((point) => ({
                date: formatChartDate(point.date),
                revenue: point.revenue,
                orders: point.orderCount,
            })),
        [revenue?.breakdown],
    );

    const statusSeries = useMemo(() => {
        if (!orderStatus) return [];

        return [
            { name: "Pending", value: orderStatus.pending },
            { name: "Confirmed", value: orderStatus.confirmed },
            { name: "Preparing", value: orderStatus.preparing },
            { name: "Delivering", value: orderStatus.delivering },
            { name: "Completed", value: orderStatus.completed },
            { name: "Cancelled", value: orderStatus.cancelled },
        ];
    }, [orderStatus]);

    const topProductSeries = useMemo(
        () =>
            topProducts.map((item) => ({
                name: item.productName.length > 18 ? `${item.productName.slice(0, 18)}...` : item.productName,
                fullName: item.productName,
                revenue: item.totalRevenue,
                sold: item.totalQuantitySold,
            })),
        [topProducts],
    );

    const averageOrderValue = useMemo(() => {
        const totalOrders = revenue?.totalOrders ?? 0;
        if (!totalOrders) return 0;
        return (revenue?.totalRevenue ?? 0) / totalOrders;
    }, [revenue?.totalOrders, revenue?.totalRevenue]);

    return (
        <div className="space-y-6 font-manrope">
            <section className="relative overflow-hidden rounded-2xl border border-white/20 p-6 text-white shadow-xl bg-[radial-gradient(circle_at_12%_18%,rgba(238,77,45,0.32),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(124,58,237,0.24),transparent_36%),linear-gradient(130deg,#1A1623_0%,#2A1F37_50%,#392A4A_100%)] animate-[fadeIn_0.6s_ease-out]">
                <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/75">Merchant Insights</p>
                        <h1 className="mt-2 font-roboto-serif text-3xl font-semibold md:text-4xl">Reports Summary</h1>
                        <p className="mt-2 text-sm text-white/80 md:text-base">
                            Deep analytics powered by the new merchant dashboard endpoints.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <label htmlFor="merchant-reports-period" className="text-xs text-white/80">
                            Period
                        </label>
                        <select
                            id="merchant-reports-period"
                            value={period}
                            onChange={(event) => setPeriod(event.target.value as DashboardPeriod)}
                            className="rounded-lg border border-white/25 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                            title="Report period"
                        >
                            <option value="day">Day</option>
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                        </select>
                    </div>
                </div>
            </section>

            {!loading && !restaurant && (
                <section className="rounded-2xl border border-yellow-300 bg-yellow-50 p-6 text-yellow-900">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5" size={18} />
                        <div className="flex-1">
                            <p className="font-semibold">Restaurant setup required</p>
                            <p className="mt-1 text-sm opacity-90">
                                Create your restaurant profile first to unlock report analytics.
                            </p>
                            <Link
                                href="/merchant/manage/settings"
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange/90"
                            >
                                <Store size={16} />
                                Create restaurant profile
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {restaurant && (
                <>
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-boxdark">
                            <p className="text-xs uppercase tracking-[0.18em] text-bodydark">Revenue</p>
                            <p className="mt-2 font-roboto-serif text-2xl font-semibold text-black dark:text-white">
                                {formatCurrency(revenue?.totalRevenue ?? 0)}
                            </p>
                            <p className="mt-1 text-xs text-bodydark">
                                Today: {formatCurrency(overview?.revenueToday ?? 0)}
                            </p>
                        </article>

                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-boxdark">
                            <p className="text-xs uppercase tracking-[0.18em] text-bodydark">Orders</p>
                            <p className="mt-2 font-roboto-serif text-2xl font-semibold text-black dark:text-white">
                                {formatNumber(revenue?.totalOrders ?? 0)}
                            </p>
                            <p className="mt-1 text-xs text-bodydark">
                                Today: {formatNumber(overview?.ordersToday ?? 0)}
                            </p>
                        </article>

                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-boxdark">
                            <p className="text-xs uppercase tracking-[0.18em] text-bodydark">Average Order</p>
                            <p className="mt-2 font-roboto-serif text-2xl font-semibold text-black dark:text-white">
                                {formatCurrency(averageOrderValue)}
                            </p>
                            <p className="mt-1 text-xs text-bodydark">From revenue and order volume</p>
                        </article>

                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-boxdark">
                            <p className="text-xs uppercase tracking-[0.18em] text-bodydark">Restaurant Rating</p>
                            <p className="mt-2 font-roboto-serif text-2xl font-semibold text-black dark:text-white">
                                {restaurant.rating.toFixed(1)}
                            </p>
                            <p className="mt-1 text-xs text-bodydark">{formatNumber(restaurant.totalReviews)} reviews</p>
                        </article>
                    </section>

                    <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm xl:col-span-3 dark:border-white/10 dark:bg-boxdark">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                                        Revenue Timeline
                                    </h3>
                                    <p className="text-xs text-bodydark">Revenue and order throughput</p>
                                </div>
                                <Sparkles size={18} className="text-bodydark" />
                            </div>
                            <div className="h-[320px]">
                                {loading ? (
                                    <div className="h-full animate-pulse rounded-xl bg-gray" />
                                ) : revenueSeries.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-bodydark">No data.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={revenueSeries}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                            <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 12 }} />
                                            <YAxis
                                                yAxisId="left"
                                                tick={{ fill: "#6B7280", fontSize: 12 }}
                                                tickFormatter={(value) => formatNumber(value)}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                tick={{ fill: "#6B7280", fontSize: 12 }}
                                                tickFormatter={(value) => formatNumber(value)}
                                            />
                                            <Tooltip
                                                formatter={(value: number, key: string) =>
                                                    key === "revenue"
                                                        ? [formatCurrency(value), "Revenue"]
                                                        : [formatNumber(value), "Orders"]
                                                }
                                            />
                                            <Area
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#EE4D2D"
                                                fill="#EE4D2D22"
                                                strokeWidth={2.5}
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="orders"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                                dot={{ r: 3 }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </article>

                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm xl:col-span-2 dark:border-white/10 dark:bg-boxdark">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">Order Status Mix</h3>
                                <BarChart3 size={18} className="text-bodydark" />
                            </div>
                            <div className="h-[320px]">
                                {loading ? (
                                    <div className="h-full animate-pulse rounded-xl bg-gray" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statusSeries} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                            <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 12 }} />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                tick={{ fill: "#6B7280", fontSize: 12 }}
                                                width={85}
                                            />
                                            <Tooltip formatter={(value: number) => formatNumber(value)} />
                                            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                                {statusSeries.map((_, index) => (
                                                    <Cell key={index} fill={["#F59E0B", "#6366F1", "#8B5CF6", "#14B8A6", "#10B981", "#EF4444"][index % 6]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </article>
                    </section>

                    <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-boxdark">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">Top Products</h3>
                                <Package size={18} className="text-bodydark" />
                            </div>

                            <div className="h-[300px]">
                                {loading ? (
                                    <div className="h-full animate-pulse rounded-xl bg-gray" />
                                ) : topProductSeries.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-bodydark">No data.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topProductSeries}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: "#6B7280", fontSize: 11 }}
                                                interval={0}
                                                angle={-20}
                                                height={65}
                                                textAnchor="end"
                                            />
                                            <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} tickFormatter={(value) => formatNumber(value)} />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                labelFormatter={(label) => {
                                                    const item = topProductSeries.find((x) => x.name === label);
                                                    return item?.fullName || String(label);
                                                }}
                                            />
                                            <Bar dataKey="revenue" fill="#EE4D2D" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </article>

                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-boxdark">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">Live Order Feed</h3>
                                <Clock3 size={18} className="text-bodydark" />
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="h-11 animate-pulse rounded-lg bg-gray" />
                                    ))}
                                </div>
                            ) : liveOrders.length === 0 ? (
                                <div className="rounded-lg border border-black/5 p-4 text-sm text-bodydark dark:border-white/10">
                                    No active orders.
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {liveOrders.slice(0, 8).map((order) => {
                                        const status = String(order.status || "PENDING").toUpperCase();
                                        const statusColor =
                                            status === "COMPLETED"
                                                ? "bg-green-50 text-green-700"
                                                : status === "CANCELLED"
                                                  ? "bg-red-50 text-red-700"
                                                  : "bg-amber-50 text-amber-700";

                                        return (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between rounded-lg border border-black/5 px-3 py-2.5 dark:border-white/10"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-black dark:text-white">
                                                        #{order.orderCode || order.id.slice(0, 8)}
                                                    </p>
                                                    <p className="text-xs text-bodydark">{formatNumber(order.itemCount || 0)} items</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-black dark:text-white">
                                                        {formatCurrency(order.totalPrice)}
                                                    </p>
                                                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor}`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </article>
                    </section>

                    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-boxdark">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                                    {restaurant.restaurantName}
                                </h3>
                                <p className="mt-1 text-sm text-bodydark">{restaurant.address}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href="/merchant/dashboard"
                                    className="rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold text-black transition hover:bg-gray dark:border-white/10 dark:text-white"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/merchant/food"
                                    className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
                                >
                                    <ShoppingBag size={15} />
                                    Menu manager
                                </Link>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
