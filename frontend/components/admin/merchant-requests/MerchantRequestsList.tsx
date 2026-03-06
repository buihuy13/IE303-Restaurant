import { Loader2 } from "lucide-react";
import { MerchantRequestCard } from "./MerchantRequestCard";
import type { User } from "@/types";

interface MerchantRequestsListProps {
    requests: User[];
    loading: boolean;
    processingId: string | null;
    onApprove: (request: User) => void;
    onReject: (request: User) => void;
}

export function MerchantRequestsList({
    requests,
    loading,
    processingId,
    onApprove,
    onReject,
}: MerchantRequestsListProps) {
    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="animate-spin text-brand-yellow" size={40} />
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium mb-2">No requests found</p>
                    <p className="text-sm">All merchant requests have been processed</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map((request) => (
                    <MerchantRequestCard
                        key={request.id}
                        request={request}
                        processingId={processingId}
                        onApprove={onApprove}
                        onReject={onReject}
                    />
                ))}
            </div>
        </div>
    );
}
