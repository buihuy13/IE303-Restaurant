"use client";

import { dashboardApi, type DashboardDateRangePreset } from "@/lib/api/dashboardApi";
import { formatCurrency, formatNumber } from "@/lib/utils/dashboardFormat";
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Building2,
    Clock3,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
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

function periodLabelFromPreset(preset: DashboardDateRangePreset): string {
    if (preset === "7d") return "Last 7 days";
    if (preset === "30d") return "Last 30 days";
    if (preset === "90d") return "Last 90 days";
    if (preset === "ytd") return "Year to date";
    return "All time";
}

const STATUS_COLORS = ["#EE4D2D", "#F59E0B", "#3B82F6", "#8B5CF6", "#10B981", "#6B7280"];

export default function DashboardPageClient() {
    const [rangePreset, setRangePreset] = useState<DashboardDateRangePreset>("30d");
    const [loading, setLoading] = useState(true);

    const [overview, setOverview] = useState<Awaited<ReturnType<typeof dashboardApi.getAdminOverview>> | null>(null);
    const [revenue, setRevenue] = useState<Awaited<ReturnType<typeof dashboardApi.getAdminRevenue>> | null>(null);
    const [revenueCompare, setRevenueCompare] = useState<Awaited<
        ReturnType<typeof dashboardApi.getAdminRevenueCompare>
    > | null>(null);
    const [orderStatus, setOrderStatus] = useState<Awaited<ReturnType<typeof dashboardApi.getAdminOrderStatus>> | null>(
        null,
    );
    const [hourlyOrders, setHourlyOrders] = useState<Awaited<ReturnType<typeof dashboardApi.getAdminHourlyOrders>>>([]);
    const [topProducts, setTopProducts] = useState<
        Awaited<ReturnType<typeof dashboardApi.getAdminTopProducts>>["items"]
    >([]);
    const [revenueByRestaurant, setRevenueByRestaurant] = useState<
        Awaited<ReturnType<typeof dashboardApi.getAdminRevenueByRestaurant>>["items"]
    >([]);
    const [recentOrders, setRecentOrders] = useState<Awaited<ReturnType<typeof dashboardApi.getAdminRecentOrders>>>([]);
    const [userStats, setUserStats] = useState<Awaited<
        ReturnType<typeof dashboardApi.getAdminUserStatsOverview>
    > | null>(null);
    const [restaurantStats, setRestaurantStats] = useState<Awaited<
        ReturnType<typeof dashboardApi.getAdminRestaurantStats>
    > | null>(null);

    const rangeQuery = useMemo(() => dashboardApi.buildDateRangeQuery(rangePreset), [rangePreset]);
    const selectedRangeLabel = useMemo(() => periodLabelFromPreset(rangePreset), [rangePreset]);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const [
                    nextOverview,
                    nextRevenue,
                    nextRevenueCompare,
                    nextOrderStatus,
                    nextHourly,
                    nextTopProducts,
                    nextRevenueByRestaurant,
                    nextRecent,
                    nextUserStats,
                    nextRestaurantStats,
                ] = await Promise.all([
                    dashboardApi.getAdminOverview(),
                    dashboardApi.getAdminRevenue({ range: rangeQuery }),
                    rangeQuery.allTime
                        ? Promise.resolve(null)
                        : dashboardApi.getAdminRevenueCompare({ range: rangeQuery }),
                    dashboardApi.getAdminOrderStatus({ range: rangeQuery }),
                    dashboardApi.getAdminHourlyOrders(),
                    dashboardApi.getAdminTopProducts({ range: rangeQuery, limit: 6 }),
                    dashboardApi.getAdminRevenueByRestaurant({ range: rangeQuery, limit: 6 }),
                    dashboardApi.getAdminRecentOrders({ limit: 8 }),
                    dashboardApi.getAdminUserStatsOverview(),
                    dashboardApi.getAdminRestaurantStats(),
                ]);

                setOverview(nextOverview);
                setRevenue(nextRevenue);
                setRevenueCompare(nextRevenueCompare);
                setOrderStatus(nextOrderStatus);
                setHourlyOrders(nextHourly);
                setTopProducts(nextTopProducts.items);
                setRevenueByRestaurant(nextRevenueByRestaurant.items);
                setRecentOrders(nextRecent);
                setUserStats(nextUserStats);
                setRestaurantStats(nextRestaurantStats);
            } catch (error) {
                console.error("Failed to load admin dashboard", error);
                toast.error("Unable to load admin dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [rangeQuery]);

    const revenueSeries = useMemo(
        () =>
            (revenue?.breakdown ?? []).map((point) => ({
                name: formatChartDate(point.date),
                revenue: point.revenue,
                orders: point.orderCount,
            })),
        [revenue?.breakdown],
    );

    const hourlySeries = useMemo(
        () =>
            hourlyOrders.map((point) => ({
                hour: `${String(point.hour).padStart(2, "0")}:00`,
                orders: point.orderCount,
            })),
        [hourlyOrders],
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

    const kpiCards = useMemo(() => {
        const totalOrders = orderStatus?.total ?? 0;
        const rawCompletionRate = totalOrders > 0 ? ((orderStatus?.completed ?? 0) * 100) / totalOrders : 0;
        const completionRate = Math.min(rawCompletionRate, 100);
        const revenueTrend = revenueCompare?.revenueGrowthPercent ?? 0;

        return [
            {
                title: "Revenue Today",
                value: formatCurrency(overview?.revenueToday ?? 0),
                icon: DollarSign,
                hint: "Today",
                trend: 0,
            },
            {
                title: "Period Revenue",
                value: formatCurrency(revenue?.totalRevenue ?? 0),
                icon: TrendingUp,
                hint: selectedRangeLabel,
                trend: revenueTrend,
            },
            {
                title: "Period Orders",
                value: formatNumber(revenue?.totalOrders ?? 0),
                icon: ShoppingCart,
                hint: "Revenue-generating orders",
                trend: revenueCompare?.orderGrowthPercent ?? 0,
            },
            {
                title: "Total Users",
                value: formatNumber(userStats?.totalUsers ?? 0),
                icon: Users,
                hint: `+${formatNumber(userStats?.newUsersThisWeek ?? 0)} this week`,
                trend: 0,
            },
            {
                title: "Restaurants",
                value: formatNumber(restaurantStats?.totalRestaurants ?? 0),
                icon: Building2,
                hint: `${formatNumber(restaurantStats?.totalProducts ?? 0)} products`,
                trend: 0,
            },
            {
                title: "Completion Rate",
                value: `${completionRate.toFixed(1)}%`,
                icon: Activity,
                hint: `${formatNumber(orderStatus?.completed ?? 0)} completed`,
                trend: completionRate,
            },
        ];
    }, [orderStatus, overview, restaurantStats, revenue, revenueCompare, selectedRangeLabel, userStats]);

    return (
        <div className="space-y-6 font-manrope">
            <section className="relative overflow-hidden rounded-2xl border border-white/20 p-6 text-white shadow-xl md:p-8 bg-[radial-gradient(circle_at_18%_22%,rgba(238,77,45,0.35),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(255,190,92,0.28),transparent_38%),linear-gradient(135deg,#191720_0%,#2d283d_45%,#3f3655_100%)] animate-[fadeIn_0.6s_ease-out]">
                <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-[#EE4D2D]/40 blur-2xl" />
                <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/70">Control Center</p>
                        <h1 className="mt-2 font-roboto-serif text-3xl font-semibold md:text-4xl">Admin Dashboard</h1>
                        <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
                            Monitor platform health, order velocity, merchant performance, and growth signals from the
                            new dashboard-service stack.
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                        <label htmlFor="admin-dashboard-range" className="mb-1 block text-xs text-white/80">
                            Display range
                        </label>
                        <select
                            id="admin-dashboard-range"
                            value={rangePreset}
                            onChange={(event) => setRangePreset(event.target.value as DashboardDateRangePreset)}
                            className="w-full rounded-lg border border-white/25 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-white/70"
                            title="Dashboard range"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="ytd">Year to date</option>
                            <option value="all">All time</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {kpiCards.map((card, index) => {
                    const Icon = card.icon;
                    const isPositive = card.trend >= 0;

                    return (
                        <article
                            key={card.title}
                            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-boxdark animate-[fadeInUp_0.55s_ease-out]"
                            style={{ animationDelay: `${index * 70}ms` }}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-bodydark">{card.title}</p>
                                    <h2 className="mt-2 font-roboto-serif text-2xl font-semibold text-black dark:text-white">
                                        {card.value}
                                    </h2>
                                    <p className="mt-1 text-xs text-bodydark">{card.hint}</p>
                                </div>
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-yellowlight text-brand-orange">
                                    <Icon size={20} />
                                </span>
                            </div>
                            <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-gray px-2.5 py-1 text-xs font-semibold text-brand-black">
                                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(card.trend).toFixed(1)}%
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
                <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm xl:col-span-3 dark:border-white/10 dark:bg-boxdark">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                                Revenue Flow
                            </h3>
                            <p className="text-xs text-bodydark">Revenue and order trend over the selected period</p>
                        </div>
                        <span className="rounded-full bg-brand-yellowlight px-3 py-1 text-xs font-semibold text-brand-black">
                            {selectedRangeLabel}
                        </span>
                    </div>
                    <div className="h-[320px]">
                        {loading ? (
                            <div className="h-full animate-pulse rounded-xl bg-gray" />
                        ) : revenueSeries.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-bodydark">
                                No data.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueSeries} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
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
                                        fill="url(#adminRevenueGradient)"
                                        name="revenue"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </article>

                <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm xl:col-span-2 dark:border-white/10 dark:bg-boxdark">
                    <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                        Order Composition
                    </h3>
                    <p className="mt-1 text-xs text-bodydark">Distribution by status</p>

                    <div className="mt-4 h-[250px]">
                        {loading ? (
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
                                            <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
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
                                <p className="font-semibold text-black dark:text-white">{formatNumber(item.value)}</p>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
                <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm xl:col-span-2 dark:border-white/10 dark:bg-boxdark">
                    <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                        Orders by Hour
                    </h3>
                    <p className="mt-1 text-xs text-bodydark">Today, in UTC</p>
                    <div className="mt-4 h-[300px]">
                        {loading ? (
                            <div className="h-full animate-pulse rounded-xl bg-gray" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlySeries}>
                                    <XAxis dataKey="hour" tick={{ fill: "#6B7280", fontSize: 11 }} interval={2} />
                                    <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                                    <Tooltip formatter={(value: number) => formatNumber(value)} />
                                    <Bar dataKey="orders" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </article>

                <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm xl:col-span-3 dark:border-white/10 dark:bg-boxdark">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-roboto-serif text-xl font-semibold text-black dark:text-white">
                            Top Restaurants by Revenue
                        </h3>
                        <span className="text-xs text-bodydark">Top {revenueByRestaurant.length}</span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray" />
                            ))}
                        </div>
                    ) : revenueByRestaurant.length === 0 ? (
                        <p className="text-sm text-bodydark">No restaurant revenue data.</p>
                    ) : (
                        <div className="space-y-3">
                            {revenueByRestaurant.map((item, index) => {
                                const maxRevenue = Math.max(...revenueByRestaurant.map((x) => x.revenue), 1);
                                const width = `${Math.max((item.revenue / maxRevenue) * 100, 6)}%`;

                                return (
                                    <div
                                        key={item.restaurantId || item.restaurantName}
                                        className="rounded-lg border border-black/5 p-3 dark:border-white/10"
                                    >
                                        <div className="mb-1.5 flex items-center justify-between gap-3">
                                            <p className="truncate text-sm font-semibold text-black dark:text-white">
                                                {index + 1}. {item.restaurantName}
                                            </p>
                                            <p className="text-sm font-semibold text-brand-orange">
                                                {formatCurrency(item.revenue)}
                                            </p>
                                        </div>
                                        <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-[#EE4D2D] to-[#F59E0B]"
                                                style={{ width }}
                                            />
                                        </div>
                                        <p className="text-xs text-bodydark">{formatNumber(item.orderCount)} orders</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-11 animate-pulse rounded-lg bg-gray" />
                            ))}
                        </div>
                    ) : topProducts.length === 0 ? (
                        <p className="text-sm text-bodydark">No product ranking data.</p>
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
                            Recent Orders
                        </h3>
                        <Clock3 size={18} className="text-bodydark" />
                    </div>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray" />
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <p className="text-sm text-bodydark">No recent orders.</p>
                    ) : (
                        <div className="space-y-2.5">
                            {recentOrders.map((order) => {
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
                                                {order.restaurantName || "Restaurant"}
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
        </div>
    );
}
