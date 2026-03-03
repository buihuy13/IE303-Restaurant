"use client";

import { useCartPage } from "@/hooks/cart/useCartPage";

import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";

export default function CartPageShell() {
  const {
    lines,
    subtotal,
    totalItems,
    increment,
    decrement,
    remove,
    clearCart,
  } = useCartPage();

  const isEmpty = lines.length === 0;

  return (
    <div className="custom-container py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-black md:text-3xl">
        Shopping cart
      </h1>

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-base font-semibold text-brand-black">
            Your cart is empty.
          </p>
          <p className="mt-2 text-sm text-brand-grey">
            Add some mock products from other pages to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {lines.map((line) => (
              <div key={line.productId} className="border-b border-gray-100 pb-4 last:border-b-0">
                <CartItemRow
                  name={line.name}
                  imageUrl={line.imageUrl}
                  price={line.price}
                  quantity={line.quantity}
                  lineTotal={line.lineTotal}
                  onIncrease={() => increment(line.productId)}
                  onDecrease={() => decrement(line.productId)}
                  onRemove={() => remove(line.productId)}
                />
              </div>
            ))}
          </div>
          <CartSummary
            subtotal={subtotal}
            totalItems={totalItems}
            onClear={clearCart}
          />
        </div>
      )}
    </div>
  );
}

