import { CheckCircle, Eye, Loader2, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/dashboardFormat";
import type { MerchantWithStats } from "@/hooks/admin/merchants/useAdminMerchantsData";

interface MerchantsTableProps {
    merchants: MerchantWithStats[];
    loading: boolean;
    onApprove: (merchantId: string) => void;
    onReject: (merchantId: string, reason: string) => void;
}

export function MerchantsTable({ merchants, loading, onApprove, onReject }: MerchantsTableProps) {
    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="animate-spin text-brand-yellow" size={40} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Merchant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Company
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Restaurants
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Revenue
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {merchants.map((merchant) => (
                            <tr
                                key={merchant.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                                            {merchant.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {merchant.username}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {merchant.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        {merchant.businessName || "—"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        {merchant.totalRestaurants}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        {formatCurrency(merchant.totalRevenue)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            merchant.status === "PENDING"
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                : merchant.status === "APPROVED"
                                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        }`}
                                    >
                                        {merchant.status === "PENDING"
                                            ? "Pending"
                                            : merchant.status === "APPROVED"
                                              ? "Approved"
                                              : "Rejected"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {}}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="View details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        {merchant.status === "PENDING" && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => onApprove(merchant.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const reason = prompt("Enter a rejection reason:");
                                                        if (reason != null && reason.trim()) onReject(merchant.id, reason.trim());
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {merchants.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No merchants found.
                    </div>
                )}
            </div>
        </div>
    );
}
