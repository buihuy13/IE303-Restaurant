"use client";

import { CheckCircle, Package, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";

import { useMerchantOrders } from "@/hooks/merchant/useMerchantOrders";

export default function MerchantOrdersPageShell() {
  const {
    orders,
    filterStatus,
    setFilterStatus,
    statusLabels,
    handleAccept,
    handleReject,
    handleUpdateStatus,
    getNextStatus,
  } = useMerchantOrders();

  const statuses = [
    "ALL",
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "completed",
    "cancelled",
  ] as const;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "confirmed":
      case "preparing":
      case "ready":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Order Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track your restaurant orders (mock)
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-[#EE4D2D] px-4 py-2 text-sm font-medium text-white hover:bg-[#EE4D2D]/90"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status === "ALL" ? "ALL" : status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === status
                ? "bg-[#EE4D2D] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status === "ALL" ? "All" : statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              return (
                <div
                  key={order.orderId}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderId}</p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} item(s) •{" "}
                      {new Date(order.createdAt).toLocaleString()} •{" "}
                      {order.finalAmount.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                    {order.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAccept(order.orderId)}
                          className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(order.orderId)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {nextStatus && order.status !== "pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(order.orderId, nextStatus)
                        }
                        className="rounded-lg border border-[#EE4D2D]/30 bg-[#EE4D2D]/10 px-3 py-1.5 text-xs font-medium text-[#EE4D2D] hover:bg-[#EE4D2D]/20"
                      >
                        → {statusLabels[nextStatus]}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
