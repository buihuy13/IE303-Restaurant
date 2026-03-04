import type { MockAdminPromotion } from "@/constants";

type AdminPromotionRowProps = {
  promotion: MockAdminPromotion;
  formatDate: (d: string) => string;
};

export function AdminPromotionRow({ promotion, formatDate }: AdminPromotionRowProps) {
  const discountLabel =
    promotion.discountType === "percent"
      ? `${promotion.discountValue}%`
      : `${promotion.discountValue.toLocaleString("vi-VN")}₫`;
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium text-gray-900">{promotion.name}</p>
        <p className="text-sm text-gray-500">
          {formatDate(promotion.startDate)} – {formatDate(promotion.endDate)} · {discountLabel}
        </p>
      </div>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          promotion.status === "active"
            ? "bg-green-100 text-green-800"
            : promotion.status === "scheduled"
              ? "bg-amber-100 text-amber-800"
              : "bg-gray-100 text-gray-700"
        }`}
      >
        {promotion.status}
      </span>
    </li>
  );
}
