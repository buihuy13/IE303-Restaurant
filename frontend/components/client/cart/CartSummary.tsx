type CartSummaryProps = {
  subtotal: number;
  totalItems: number;
  onClear: () => void;
};

export function CartSummary({
  subtotal,
  totalItems,
  onClear,
}: CartSummaryProps) {
  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-brand-black">Order summary</h2>
      <p className="mt-1 text-xs text-brand-grey">
        Mock cart summary for IE303 (no real payment).
      </p>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-brand-grey">Items</span>
          <span className="font-semibold text-brand-black">
            {totalItems}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-brand-grey">Subtotal</span>
          <span className="text-base font-bold text-brand-orange">
            {subtotal.toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-brand-black hover:bg-gray-50"
      >
        Clear cart
      </button>
      <button
        type="button"
        disabled
        className="mt-3 w-full rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-brand-white opacity-60"
      >
        Checkout (mock)
      </button>
    </aside>
  );
}

