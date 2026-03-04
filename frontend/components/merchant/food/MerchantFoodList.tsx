import type { MockMerchantFoodItem } from "@/constants";

import { MerchantFoodItemRow } from "./MerchantFoodItemRow";

type MerchantFoodListProps = {
  items: MockMerchantFoodItem[];
  formatPrice: (price: number) => string;
};

/** Chỉ render danh sách món: map items sang MerchantFoodItemRow, xử lý empty state */
export function MerchantFoodList({
  items,
  formatPrice,
}: MerchantFoodListProps) {
  if (items.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-gray-500">
        No menu items. Add one to get started.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {items.map((item) => (
        <MerchantFoodItemRow
          key={item.id}
          item={item}
          formattedPrice={formatPrice(item.price)}
        />
      ))}
    </ul>
  );
}
