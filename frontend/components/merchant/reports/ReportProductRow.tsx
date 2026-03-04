type ReportProductRowProps = {
  rank: number;
  productName: string;
  quantitySold: string;
  revenueFormatted: string;
};

/** Chỉ render 1 dòng sản phẩm trong báo cáo: rank, tên, số lượng bán, doanh thu */
export function ReportProductRow({
  rank,
  productName,
  quantitySold,
  revenueFormatted,
}: ReportProductRowProps) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
      <span className="font-medium text-gray-900">
        #{rank} {productName}
      </span>
      <span className="text-sm text-gray-600">
        {quantitySold} sold • {revenueFormatted}₫
      </span>
    </li>
  );
}
