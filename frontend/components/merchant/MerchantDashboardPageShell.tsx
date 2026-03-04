"use client";

import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  Star,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";

import { useMerchantDashboard } from "@/hooks/merchant/useMerchantDashboard";

export default function MerchantDashboardPageShell() {
  const { restaurant, stats, formatCurrency, formatNumber } =
    useMerchantDashboard();

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      trend: "11% vs last month",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      trend: "2.6% vs last month",
    },
    {
      title: "Products",
      value: restaurant.totalProducts,
      icon: Package,
    },
    {
      title: "Avg Rating",
      value: restaurant.rating.toFixed(1),
      icon: Star,
      trend: `${formatNumber(restaurant.totalReviews)} reviews`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Merchant Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Hello, Merchant! (mock data)
          </p>
        </div>
        <Link
          href="/merchant/food/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#EE4D2D] px-4 py-2 text-sm font-medium text-white hover:bg-[#EE4D2D]/90"
        >
          <Store className="h-4 w-4" />
          Add Menu Item
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EE4D2D]/10">
                <card.icon className="h-5 w-5 text-[#EE4D2D]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                {card.trend && (
                  <p className="mt-1 text-xs text-gray-500">{card.trend}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Restaurant Info
          </h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900">{restaurant.restaurantName}</p>
            <p className="text-gray-600">{restaurant.address}</p>
            <p className="text-gray-600">
              {restaurant.openingTime} – {restaurant.closingTime} • Rating{" "}
              {restaurant.rating} ({restaurant.totalReviews} reviews)
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              href="/merchant/food"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage Menu
            </Link>
            <Link
              href={`/restaurants/${restaurant.restaurantSlug}`}
              className="rounded-lg bg-[#EE4D2D] px-3 py-2 text-sm font-medium text-white hover:bg-[#EE4D2D]/90"
            >
              View Storefront
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Order Status
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-sm text-amber-800">Pending</p>
              <p className="text-2xl font-bold text-amber-900">
                {stats.pendingOrders}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-800">In Progress</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.confirmedOrders + stats.preparingOrders}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm text-green-800">Completed</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.completedOrders}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-sm text-red-800">Cancelled</p>
              <p className="text-2xl font-bold text-red-900">
                {stats.cancelledOrders}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/merchant/food"
            className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EE4D2D]/10">
              <Store className="h-6 w-6 text-[#EE4D2D]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Manage Menu</p>
              <p className="text-sm text-gray-500">Add and edit items</p>
            </div>
          </Link>
          <Link
            href="/merchant/manage/staff"
            className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Staff</p>
              <p className="text-sm text-gray-500">Manage staff</p>
            </div>
          </Link>
          <Link
            href="/merchant/reports"
            className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <BarChart3 className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Reports</p>
              <p className="text-sm text-gray-500">View analytics</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
