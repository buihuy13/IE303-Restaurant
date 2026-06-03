"use client";

import { dashboardApi, type DashboardDateRangePreset } from "@/lib/api/dashboardApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatCurrency, formatNumber } from "@/lib/utils/dashboardFormat";
import {
    Activity,
    AlertCircle,
    Clock3,
    DollarSign,
    Package,
    ShoppingCart,
    Star,
    Store,
    TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Area, AreaChart, Pie, PieChart, ResponsiveContainer, Tooltip, Cell, XAxis, YAxis } from "recharts";

function formatChartDate(dateLike: string): string {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return dateLike;
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

const STATUS_COLORS = ["#F59E0B", "#6366F1", "#8B5CF6", "#14B8A6", "#10B981", "#EF4444"];

export default function MerchantDashboardPageClient() {
    const { user } = useAuthStore();

    const [rangePreset, setRangePreset] = useState<DashboardDateRangePreset>("30d");
    const [loadingRestaurant, setLoadingRestaurant] = useState(true);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    const [restaurant, setRestaurant] = useState<Awaited<
        ReturnType<typeof dashboardApi.getMerchantRestaurantOverview>
    > | null>(null);
    const [overview, setOverview] = useState<Awaited<ReturnType<typeof dashboardApi.getMerchantOverview>> | null>(null);
    const [revenue, setRevenue] = useState<Awaited<ReturnType<typeof dashboardApi.getMerchantRevenue>> | null>(null);
    const [orderStatus, setOrderStatus] = useState<Awaited<
        ReturnType<typeof dashboardApi.getMerchantOrderStatus>
    > | null>(null);
    const [topProducts, setTopProducts] = useState<
        Awaited<ReturnType<typeof dashboardApi.getMerchantTopProducts>>["items"]
    >([]);
    const [liveOrders, setLiveOrders] = useState<Awaited<ReturnType<typeof dashboardApi.getMerchantLiveOrders>>>([]);

    const period = useMemo(() => dashboardApi.mapPresetToPeriod(rangePreset), [rangePreset]);

    useEffect(() => {
        if (!user?.id) {
            setLoadingRestaurant(false);
            return;
        }

        const run = async () => {
            setLoadingRestaurant(true);
            try {
                const data = await dashboardApi.getMerchantRestaurantOverview(user.id);
                setRestaurant(data);
            } catch (error: unknown) {
                const status =
                    error && typeof error === "object" && "response" in error
                        ? (error as { response?: { status?: number } }).response?.status
                        : undefined;

                if (status === 404) {
                    setRestaurant(null);
                    return;
                }

                console.error("Failed to load merchant restaurant", error);
                toast.error("Unable to load restaurant profile.");
            } finally {
                setLoadingRestaurant(false);
            }
        };

        run();
    }, [user?.id]);

    useEffect(() => {
        if (!restaurant?.restaurantId) {
            setLoadingDashboard(false);
            return;
        }

        const run = async () => {
            setLoadingDashboard(true);
            try {
                const [nextOverview, nextRevenue, nextOrderStatus, nextTopProducts, nextLiveOrders] = await Promise.all(
                    [
                        dashboardApi.getMerchantOverview(restaurant.restaurantId),
                        dashboardApi.getMerchantRevenue(restaurant.restaurantId, { period, preset: rangePreset }),
                        dashboardApi.getMerchantOrderStatus(restaurant.restaurantId, {
                            period,
                            preset: rangePreset,
                        }),
                        dashboardApi.getMerchantTopProducts(restaurant.restaurantId, {
                            period,
                            limit: 6,
                            preset: rangePreset,
                        }),
                        dashboardApi.getMerchantLiveOrders(restaurant.restaurantId),
                    ],
                );

                setOverview(nextOverview);
                setRevenue(nextRevenue);
                setOrderStatus(nextOrderStatus);
                setTopProducts(nextTopProducts.items);
                setLiveOrders(nextLiveOrders);
            } catch (error) {
                console.error("Failed to load merchant dashboard", error);
                toast.error("Unable to load merchant dashboard.");
            } finally {
                setLoadingDashboard(false);
            }
        };

        run();
    }, [period, rangePreset, restaurant?.restaurantId]);

    const revenueSeries = useMemo(
        () =>
            (revenue?.breakdown ?? []).map((point) => ({
                name: formatChartDate(point.date),
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
        ].filter((item) => item.value > 0);
    }, [orderStatus]);

    const kpis = useMemo(() => {
        const totalOrders = orderStatus?.total ?? 0;
        const averageOrderValue = totalOrders > 0 ? (revenue?.totalRevenue ?? 0) / totalOrders : 0;

        return [
            {
                title: "Revenue Today",
                value: formatCurrency(overview?.revenueToday ?? 0),
                icon: DollarSign,
                hint: "Daily gross revenue",
            },
            {
                title: "Revenue This Month",
                value: formatCurrency(overview?.revenueThisMonth ?? 0),
                icon: TrendingUp,
                hint: `Total orders: ${formatNumber(revenue?.totalOrders ?? 0)}`,
            },
            {
                title: "Orders Today",
                value: formatNumber(overview?.ordersToday ?? 0),
                icon: ShoppingCart,
                hint: "Real-time operational load",
            },
            {
                title: "Average Order",
                value: formatCurrency(averageOrderValue),
                icon: Activity,
                hint: `${formatNumber(totalOrders)} orders in selected period`,
            },
        ];
    }, [
        orderStatus?.total,
        overview?.ordersToday,
        overview?.revenueThisMonth,
        overview?.revenueToday,
        revenue?.totalOrders,
        revenue?.totalRevenue,
    ]);

    return (
        <div className="space-y-6 font-manrope">
            <section className="relative overflow-hidden rounded-2xl border border-white/20 p-6 text-white shadow-xl bg-[radial-gradient(circle_at_10%_20%,rgba(238,77,45,0.35),transparent_40%),radial-gradient(circle_at_92%_0%,rgba(16,185,129,0.26),transparent_36%),linear-gradient(130deg,#18141f_0%,#2c2233_50%,#3f2d3f_100%)] animate-[fadeIn_0.6s_ease-out]">
                <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/75">Merchant Console</p>
                        <h1 className="mt-2 font-roboto-serif text-3xl font-semibold md:text-4xl">
                            Merchant Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-white/80 md:text-base">
                            Track your restaurant performance, live order flow, and top products from the new
                            dashboard-service APIs.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={rangePreset}
                            onChange={(event) => setRangePreset(event.target.value as DashboardDateRangePreset)}
                            className="rounded-lg border border-white/25 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                            title="Dashboard range"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="ytd">Year to date</option>
                            <option value="all">All time</option>
                        </select>

                        <Link
                            href="/merchant/food/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
                        >
                            <Store size={16} />
                            Add Menu Item
                        </Link>
                    </div>
                </div>
            </section>

            {!loadingRestaurant && !restaurant && (
                <section className="rounded-2xl border border-yellow-300 bg-yellow-50 p-6 text-yellow-900">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5" size={18} />
                        <div className="flex-1">
                            <p className="font-semibold">Restaurant setup required</p>
                            <p className="mt-1 text-sm opacity-90">
                                Your merchant account is active, but no restaurant profile is linked yet.
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
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {kpis.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <article
                                    key={card.title}
                                    className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-boxdark animate-[fadeInUp_0.55s_ease-out]"
                                    style={{ animationDelay: `${index * 70}ms` }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-bodydark">
                                                {card.title}
                                            </p>
                                            <h2 className="mt-2 font-roboto-serif text-2xl font-semibold text-black dark:text-white">
                                                {card.value}
                                            </h2>
                                            <p className="mt-1 text-xs text-bodydark">{card.hint}</p>
                                        </div>
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellowlight text-brand-orange">
                                            <Icon size={18} />
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm xl:col-span-3 dark:border-white/10 dark:bg-boxdark">
                            <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                                Revenue Trend
                            </h3>
                            <p className="mt-1 text-xs text-bodydark">Selected period breakdown</p>
                            <div className="mt-4 h-[300px]">
                                {loadingDashboard ? (
                                    <div className="h-full animate-pulse rounded-xl bg-gray" />
                                ) : revenueSeries.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-bodydark">
                                        No data.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueSeries}>
                                            <defs>
                                                <linearGradient
                                                    id="merchantRevenueGradientV2"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop offset="5%" stopColor="#EE4D2D" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#EE4D2D" stopOpacity={0.04} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} />
                                            <YAxis
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
                                                dataKey="revenue"
                                                type="monotone"
                                                stroke="#EE4D2D"
                                                strokeWidth={2.5}
                                                fill="url(#merchantRevenueGradientV2)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </article>

                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm xl:col-span-2 dark:border-white/10 dark:bg-boxdark">
                            <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                                Order Status
                            </h3>
                            <p className="mt-1 text-xs text-bodydark">Volume by status</p>
                            <div className="mt-4 h-[230px]">
                                {loadingDashboard ? (
                                    <div className="h-full animate-pulse rounded-xl bg-gray" />
                                ) : statusSeries.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-bodydark">
                                        No data.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusSeries}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius="56%"
                                                outerRadius="82%"
                                                paddingAngle={3}
                                            >
                                                {statusSeries.map((_, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatNumber(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {statusSeries.map((item, index) => (
                                    <div
                                        key={item.name}
                                        className="rounded-lg border border-black/5 p-2.5 text-xs dark:border-white/10"
                                    >
                                        <div className="mb-1 inline-flex items-center gap-2">
                                            <span
                                                className="inline-flex h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}
                                            />
                                            <span className="text-bodydark">{item.name}</span>
                                        </div>
                                        <p className="font-semibold text-black dark:text-white">
                                            {formatNumber(item.value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </section>

                    <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-boxdark">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                                    Top Products
                                </h3>
                                <Package size={18} className="text-bodydark" />
                            </div>
                            {loadingDashboard ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="h-11 animate-pulse rounded-lg bg-gray" />
                                    ))}
                                </div>
                            ) : topProducts.length === 0 ? (
                                <p className="text-sm text-bodydark">No product data.</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {topProducts.map((product, index) => (
                                        <div
                                            key={`${product.productId}-${index}`}
                                            className="flex items-center justify-between rounded-lg border border-black/5 px-3 py-2.5 dark:border-white/10"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-black dark:text-white">
                                                    #{index + 1} {product.productName}
                                                </p>
                                                <p className="text-xs text-bodydark">
                                                    {formatNumber(product.totalQuantitySold)} sold
                                                    {product.sizeName ? ` • ${product.sizeName}` : ""}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-brand-orange">
                                                {formatCurrency(product.totalRevenue)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>

                        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-boxdark">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                                    Live Orders
                                </h3>
                                <Clock3 size={18} className="text-bodydark" />
                            </div>
                            {loadingDashboard ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="h-11 animate-pulse rounded-lg bg-gray" />
                                    ))}
                                </div>
                            ) : liveOrders.length === 0 ? (
                                <p className="text-sm text-bodydark">No active orders right now.</p>
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
                                                    <p className="text-xs text-bodydark">
                                                        {formatNumber(order.itemCount || 0)} items
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-black dark:text-white">
                                                        {formatCurrency(order.totalPrice)}
                                                    </p>
                                                    <span
                                                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColor}`}
                                                    >
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
                        <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                            Restaurant Snapshot
                        </h3>
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
                            <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray">
                                {restaurant.imageURL ? (
                                    <Image
                                        src={restaurant.imageURL}
                                        alt={restaurant.restaurantName}
                                        width={64}
                                        height={64}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-bodydark">
                                        <Store size={28} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-black dark:text-white">{restaurant.restaurantName}</p>
                                <p className="text-sm text-bodydark">{restaurant.address}</p>
                                <div className="mt-1 inline-flex items-center gap-1 text-xs text-bodydark">
                                    <Star size={14} className="text-amber-500" />
                                    {restaurant.rating.toFixed(1)} ({formatNumber(restaurant.totalReviews)} reviews)
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 md:justify-end">
                                <Link
                                    href="/merchant/food"
                                    className="rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold text-black transition hover:bg-gray dark:border-white/10 dark:text-white"
                                >
                                    Manage menu
                                </Link>
                                <Link
                                    href="/merchant/reports"
                                    className="rounded-lg bg-brand-orange px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
                                >
                                    Open reports
                                </Link>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
