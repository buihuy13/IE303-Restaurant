import type { CartItem, Product } from "@/types";

type PaymentSummaryLine = {
  item: CartItem;
  product: Product | undefined;
};

type PaymentSummaryProps = {
  lines: PaymentSummaryLine[];
};

export default function PaymentSummary({ lines }: PaymentSummaryProps) {
  const subtotal = lines.reduce((sum, line) => {
    if (!line.product) return sum;
    return sum + line.product.price * line.item.quantity;
  }, 0);

  const deliveryFee = subtotal > 0 ? 15000 : 0;
  const total = subtotal + deliveryFee;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>

      <div className="space-y-3">
        {lines.map((line) =>
          line.product ? (
            <div
              key={line.item.productId}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {line.product.name}
                </p>
                <p className="text-xs text-gray-500">
                  Qty: {line.item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {(line.product.price * line.item.quantity).toLocaleString(
                  "vi-VN",
                )}
                ₫
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

      <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{subtotal.toLocaleString("vi-VN")}₫</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery fee</span>
          <span>{deliveryFee.toLocaleString("vi-VN")}₫</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-900 pt-1">
          <span>Total</span>
          <span>{total.toLocaleString("vi-VN")}₫</span>
        </div>
      </div>
    </section>
  );
}

