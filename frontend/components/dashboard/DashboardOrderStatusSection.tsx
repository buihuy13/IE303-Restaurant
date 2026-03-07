import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils/dashboardFormat";
import type { BreakdownItem } from "@/hooks/admin/dashboard/useAdminDashboardData";

interface DashboardOrderStatusSectionProps {
    items: BreakdownItem[];
}

function getStatusIcon(name: string | undefined) {
    const n = (name || "").toLowerCase();
    if (n.includes("pending")) return Clock;
    if (n.includes("completed")) return CheckCircle2;
    if (n.includes("cancel")) return XCircle;
    return AlertCircle;
}

function getStatusColor(name: string | undefined) {
    const n = (name || "").toLowerCase();
    if (n.includes("pending")) return "text-warning bg-warning/10";
    if (n.includes("completed")) return "text-meta-3 bg-meta-3/10";
    if (n.includes("cancel")) return "text-meta-1 bg-meta-1/10";
    return "text-primary bg-primary/10";
}

export function DashboardOrderStatusSection({ items }: DashboardOrderStatusSectionProps) {
    return (
        <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                <h3 className="font-semibold text-black dark:text-white">Order Status</h3>
            </div>
            <div className="p-6">
                {items.length === 0 ? (
                    <p className="text-sm text-bodydark">No data yet.</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, index) => {
                            const Icon = getStatusIcon(item.name);
                            const colorClass = getStatusColor(item.name);
                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray dark:hover:bg-meta-4 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-black dark:text-white capitalize">
                                                {item.name || "Unknown"}
                                            </p>
                                            <p className="text-xs text-bodydark">
                                                {formatNumber(item.count)} orders
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-black dark:text-white">
                                        {formatCurrency(item.amount)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
