import { useMemo } from "react";

import { mockProducts } from "@/constants";
import { useCartStore } from "@/stores/use-cart-store";

type CartLine = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  lineTotal: number;
};

export function useCartPage() {
  const { items, setItems, clear } = useCartStore();

  const lines: CartLine[] = useMemo(() => {
    return items
      .map((item) => {
        const product = mockProducts.find((p) => p.id === item.productId);
        if (!product) return null;
        const lineTotal = product.price * item.quantity;

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: item.quantity,
          lineTotal,
        };
      })
      .filter((v): v is CartLine => v !== null);
  }, [items]);

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.lineTotal, 0),
    [lines],
  );

  const totalItems = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const setQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(items.filter((it) => it.productId !== productId));
      return;
    }
    setItems(
      items.map((it) =>
        it.productId === productId ? { ...it, quantity } : it,
      ),
    );
  };

  const increment = (productId: string) => {
    const current = items.find((it) => it.productId === productId);
    if (!current) return;
    setQuantity(productId, current.quantity + 1);
  };

  const decrement = (productId: string) => {
    const current = items.find((it) => it.productId === productId);
    if (!current) return;
    setQuantity(productId, current.quantity - 1);
  };

  const remove = (productId: string) => {
    setItems(items.filter((it) => it.productId !== productId));
  };

  const clearCart = () => {
    clear();
  };

  return {
    lines,
    subtotal,
    totalItems,
    increment,
    decrement,
    remove,
    clearCart,
  };
}

