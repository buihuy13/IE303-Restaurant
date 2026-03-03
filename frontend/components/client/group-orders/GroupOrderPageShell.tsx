"use client";

import { Copy } from "lucide-react";

import { useGroupOrderPage } from "@/hooks/group-orders/useGroupOrderPage";

export default function GroupOrderPageShell() {
  const { groupOrder, totalAmount, handleCopy } = useGroupOrderPage();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="custom-container py-8 space-y-6">
        <header className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Group order at {groupOrder.restaurantName}
            </h1>
            <p className="text-sm text-gray-500">
              Status:{" "}
              <span className="font-medium text-[#EE4D2D]">
                {groupOrder.status}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Copy className="w-4 h-4" />
            Copy share link
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Participants
            </h2>
            <div className="space-y-4">
              {groupOrder.participants.map((participant) => {
                const subtotal = participant.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0,
                );
                return (
                  <div
                    key={participant.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">
                        {participant.name}
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {subtotal.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {participant.items.map((item, index) => (
                        <li key={`${participant.id}-${index}`}>
                          {item.quantity} × {item.name} ·{" "}
                          {item.price.toLocaleString("vi-VN")}₫
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Group total
            </h2>
            <p className="text-2xl font-bold text-[#EE4D2D]">
              {totalAmount.toLocaleString("vi-VN")}₫
            </p>
            <p className="text-xs text-gray-500">
              This is a mock summary of the group order. No real payment or
              API calls are performed.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}

