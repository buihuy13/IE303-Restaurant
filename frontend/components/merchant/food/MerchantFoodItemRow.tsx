import Link from "next/link";

import type { MockMerchantFoodItem } from "@/constants";

type MerchantFoodItemRowProps = {
  item: MockMerchantFoodItem;
  formattedPrice: string;
};

/** Chỉ render 1 dòng món: tên, category, enabled, giá, link Edit */
export function MerchantFoodItemRow({
  item,
  formattedPrice,
}: MerchantFoodItemRowProps) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500">
          {item.category} • {item.enabled ? "Enabled" : "Disabled"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-gray-900">{formattedPrice}</span>
        <Link
          href={`/merchant/food/edit/${item.id}`}
          className="text-sm font-medium text-[#EE4D2D] hover:underline"
        >
          Edit
        </Link>
      </div>
    </li>
  );
}
