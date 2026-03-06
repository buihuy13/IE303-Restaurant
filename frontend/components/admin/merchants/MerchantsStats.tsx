interface MerchantsStatsProps {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export function MerchantsStats({ total, pending, approved, rejected }: MerchantsStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total merchants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{pending}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{approved}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{rejected}</p>
            </div>
        </div>
    );
}
