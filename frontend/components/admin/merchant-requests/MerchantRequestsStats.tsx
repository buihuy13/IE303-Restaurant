interface MerchantRequestsStatsProps {
    total: number;
    filtered: number;
}

export function MerchantRequestsStats({ total, filtered }: MerchantRequestsStatsProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-6">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Pending Requests</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{total}</p>
                </div>
                <div className="h-12 w-px bg-gray-300 dark:bg-gray-700" />
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Found</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{filtered}</p>
                </div>
            </div>
        </div>
    );
}
