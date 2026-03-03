"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";

import { useJoinGroupOrderPage } from "@/hooks/group-orders/useJoinGroupOrderPage";

export default function JoinGroupOrderPageShell() {
  const {
    restaurantName,
    menu,
    quantities,
    selectedItems,
    total,
    handleIncrease,
    handleDecrease,
    handleSubmit,
  } = useJoinGroupOrderPage();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="custom-container py-8 space-y-6">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-[#EE4D2D] font-semibold">
            Join group order
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{restaurantName}</h1>
          <p className="text-sm text-gray-500">
            Choose your dishes below. This is a mock interface, no real order
            will be created.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <div className="space-y-3">
              {menu.map((product) => {
                const quantity = quantities[product.id] ?? 0;
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-[#EE4D2D]">
                        {product.price.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecrease(product.id)}
                        className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncrease(product.id)}
                        className="h-8 w-8 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center hover:bg-[#EE4D2D]/90"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Your items</h2>
            {selectedItems.length === 0 ? (
              <p className="text-sm text-gray-500">
                You haven&apos;t chosen any items yet.
              </p>
            ) : (
              <ul className="space-y-2 text-sm text-gray-700">
                {selectedItems.map((line) => (
                  <li
                    key={line.item.id}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {line.quantity} × {line.item.name}
                    </span>
                    <span className="font-medium">
                      {(line.item.price * line.quantity).toLocaleString(
                        "vi-VN",
                      )}
                      ₫
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>Total</span>
              <span>{total.toLocaleString("vi-VN")}₫</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#EE4D2D] text-white py-3 text-sm font-semibold hover:bg-[#EE4D2D]/90"
            >
              <ShoppingCart className="w-4 h-4" />
              Confirm items
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}

