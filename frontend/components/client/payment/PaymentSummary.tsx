import type { CartItem, Product } from "@/types";

type PaymentSummaryLine = {
  item: CartItem;
  product: Product | undefined;
};

type PaymentSummaryProps = {
  lines: PaymentSummaryLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  formatPrice: (v: number) => string;
};

export default function PaymentSummary({
  lines,
  subtotal,
  deliveryFee,
  total,
  formatPrice,
}: PaymentSummaryProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>

      <div className="space-y-3">
        {lines.map((line) =>
          line.product ? (
            <div
              key={line.item.productId}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium text-gray-900">{line.product.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {line.item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {formatPrice(line.product.price * line.item.quantity)}
              </p>
            </div>
          ) : null,
        )}

        {lines.length === 0 && (
          <p className="text-sm text-gray-500">
            Your cart is empty. Add some items to see them here.
          </p>
        )}
      </div>

      <div className="space-y-1 border-t border-gray-200 pt-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery fee</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
        <div className="flex justify-between pt-1 font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </section>
  );
}
