import { Calendar, CheckCircle, Mail, User, XCircle } from "lucide-react";
import type { User as UserType } from "@/types";

interface MerchantRequestCardProps {
    request: UserType;
    processingId: string | null;
    onApprove: (request: UserType) => void;
    onReject: (request: UserType) => void;
}

export function MerchantRequestCard({
    request,
    processingId,
    onApprove,
    onReject,
}: MerchantRequestCardProps) {
    const isProcessing = processingId === request.id;

    return (
        <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                        {request.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {request.username}
                            </h3>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-medium rounded-full">
                                Pending
                            </span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail size={16} />
                                <span>{request.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <User size={16} />
                                <span>Reason: Not provided</span>
                            </div>
                            {request.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <User size={16} />
                                    <span>{request.phone}</span>
                                </div>
                            )}
                            {request.createdAt && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar size={16} />
                                    <span>
                                        Registered:{" "}
                                        {new Date(request.createdAt).toLocaleDateString("en-US")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:ml-4">
                    <button
                        onClick={() => onApprove(request)}
                        disabled={isProcessing}
                        className="h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle size={18} />
                        <span>Approve</span>
                    </button>
                    <button
                        onClick={() => onReject(request)}
                        disabled={isProcessing}
                        className="h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <XCircle size={18} />
                        <span>Reject</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
