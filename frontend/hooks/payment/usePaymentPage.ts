import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { mockCartItems, mockProducts } from "@/constants";

type PaymentMethod = "card" | "cod" | "wallet";

export function usePaymentPage() {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const summaryLines = useMemo(
    () =>
      mockCartItems.map((item) => ({
        item,
        product: mockProducts.find((p) => p.id === item.productId),
      })),
    [],
  );

  const subtotal = useMemo(
    () =>
      summaryLines.reduce((sum, line) => {
        if (!line.product) return sum;
        return sum + line.product.price * line.item.quantity;
      }, 0),
    [summaryLines],
  );
  const deliveryFee = subtotal > 0 ? 15000 : 0;
  const total = subtotal + deliveryFee;
  const formatPrice = (v: number) => v.toLocaleString("vi-VN") + "₫";

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Payment successful (mock). Your order is being prepared!");
      setIsSubmitting(false);
    }, 800);
  };

  return {
    method,
    setMethod,
    isSubmitting,
    summaryLines,
    subtotal,
    deliveryFee,
    total,
    formatPrice,
    handleConfirm,
  };
}

