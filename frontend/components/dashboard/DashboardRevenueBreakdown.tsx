import { DollarSign, Percent, ShoppingCart, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils/dashboardFormat";
import type { RevenueBreakdownData } from "@/hooks/admin/dashboard/useAdminDashboardData";

interface DashboardRevenueBreakdownProps {
    data: RevenueBreakdownData | null;
}

export function DashboardRevenueBreakdown({ data }: DashboardRevenueBreakdownProps) {
    return (
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-5 text-xl font-semibold text-black dark:text-white">Revenue Breakdown</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                            <DollarSign size={20} className="text-primary" />
                        </div>
                        <p className="text-sm font-medium text-bodydark">Product Total</p>
                    </div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                        {formatCurrency(data?.totalProductAmount ?? 0)}
                    </p>
                </div>
                <div className="rounded-lg bg-meta-3/5 p-4 border border-meta-3/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-3/20">
                            <ShoppingCart size={20} className="text-meta-3" />
                        </div>
                        <p className="text-sm font-medium text-bodydark">Delivery Fees</p>
                    </div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                        {formatCurrency(data?.totalDeliveryFee ?? 0)}
                    </p>
                </div>
                <div className="rounded-lg bg-warning/5 p-4 border border-warning/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
                            <Percent size={20} className="text-warning" />
                        </div>
                        <p className="text-sm font-medium text-bodydark">Tax</p>
                    </div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                        {formatCurrency(data?.totalTax ?? 0)}
                    </p>
                </div>
                <div className="rounded-lg bg-meta-1/5 p-4 border border-meta-1/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-1/20">
                            <TrendingDown size={20} className="text-meta-1" />
                        </div>
                        <p className="text-sm font-medium text-bodydark">Discounts</p>
                    </div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                        {formatCurrency(data?.totalDiscount ?? 0)}
                    </p>
                </div>
            </div>
        </div>
    );
}
