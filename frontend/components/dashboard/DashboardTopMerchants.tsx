import { formatCurrency, formatNumber, safeToFixed } from "@/lib/utils/dashboardFormat";
import type { MerchantPerformanceItem } from "@/hooks/admin/dashboard/useAdminDashboardData";

interface DashboardTopMerchantsProps {
    items: MerchantPerformanceItem[];
}

export function DashboardTopMerchants({ items }: DashboardTopMerchantsProps) {
    return (
        <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                <h3 className="font-semibold text-black dark:text-white">Top Restaurants</h3>
            </div>
            <div className="p-6">
                {items.length === 0 ? (
                    <p className="text-sm text-bodydark">No data yet.</p>
                ) : (
                    <div className="space-y-3">
                        {items.slice(0, 5).map((merchant, index) => (
                            <div
                                key={merchant.merchantId}
                                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray dark:hover:bg-meta-4 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                        #{index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-black dark:text-white">
                                            {merchant.restaurantName}
                                        </p>
                                        <p className="text-xs text-bodydark">
                                            {formatNumber(merchant.orders)} orders •{" "}
                                            {safeToFixed(merchant.completionRate)}% completion
                                        </p>
                                    </div>
                                </div>
                                <p className="font-semibold text-meta-3">{formatCurrency(merchant.revenue)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
