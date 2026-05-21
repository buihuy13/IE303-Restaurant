import type { ApplicationStatus } from "@/types";

interface StatsItem {
    label: string;
    count: number;
    color: string;
}

interface MerchantApplicationsHeaderProps {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export function MerchantApplicationsHeader({
    total,
    pending,
    approved,
    rejected,
}: MerchantApplicationsHeaderProps) {
    const stats: StatsItem[] = [
        { label: "Total", count: total, color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200" },
        { label: "Pending", count: pending, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
        { label: "Approved", count: approved, color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
        { label: "Rejected", count: rejected, color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
    ];

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Merchant Applications
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Review and manage merchant registration requests
                </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {stats.map((s) => (
                    <span
                        key={s.label}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${s.color}`}
                    >
                        <span>{s.label}</span>
                        <span className="font-bold">{s.count}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
