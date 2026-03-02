import { RefreshCw } from "lucide-react";

interface MerchantRequestsHeaderProps {
    loading: boolean;
    onRefresh: () => void;
}

export function MerchantRequestsHeader({ loading, onRefresh }: MerchantRequestsHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Manage Merchant Requests
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    View and approve merchant registration requests from users
                </p>
            </div>
            <button
                onClick={onRefresh}
                disabled={loading}
                className="h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-yellow px-4 text-white transition-colors hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
            </button>
        </div>
    );
}
