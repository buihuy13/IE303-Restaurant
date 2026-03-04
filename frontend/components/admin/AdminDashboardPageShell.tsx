"use client";

import {
  DollarSign,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";

export default function AdminDashboardPageShell() {
  const { stats, formatCurrency, formatNumber } = useAdminDashboard();

  const cards = [
    { title: "Total revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign },
    { title: "Total orders", value: formatNumber(stats.totalOrders), icon: ShoppingCart },
    { title: "Active users", value: formatNumber(stats.activeUsers), icon: Users },
    { title: "Restaurants", value: stats.totalRestaurants, icon: Store },
    { title: "Completion rate", value: `${stats.completionRate}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
        Admin Dashboard
      </h1>
      <p className="text-sm text-gray-600">System overview (mock data)</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                <card.icon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick links
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/users"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Users
            </Link>
            <Link
              href="/admin/merchant-requests"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Merchant requests ({stats.pendingMerchantRequests})
            </Link>
            <Link
              href="/admin/order"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Orders
            </Link>
            <Link
              href="/admin/merchants"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Merchants
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Summary
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Active merchants</dt>
              <dd className="font-medium text-gray-900">{stats.activeMerchants}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Avg order value</dt>
              <dd className="font-medium text-gray-900">
                {formatCurrency(stats.averageOrderValue)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
