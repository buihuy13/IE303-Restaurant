"use client";

import {
    CheckCircle2,
    Clock,
    Loader2,
    MapPin,
    Phone,
    Store,
    User2,
    XCircle,
} from "lucide-react";
import type { MerchantApplication } from "@/types";

const statusConfig: Record<
    MerchantApplication["status"],
    { label: string; className: string; icon: React.ElementType }
> = {
    PENDING: {
        label: "Pending",
        className:
            "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        icon: Clock,
    },
    APPROVED: {
        label: "Approved",
        className:
            "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        icon: CheckCircle2,
    },
    REJECTED: {
        label: "Rejected",
        className:
            "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
        icon: XCircle,
    },
};

interface MerchantApplicationsTableProps {
    applications: MerchantApplication[];
    loading: boolean;
}

export function MerchantApplicationsTable({
    applications,
    loading,
}: MerchantApplicationsTableProps) {

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-center p-16">
                    <Loader2 className="animate-spin text-brand-orange" size={40} />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                {[
                                    "Applicant",
                                    "Restaurant",
                                    "Contact",
                                    "Hours",
                                    "Status",
                                    "Submitted",
                                ].map((col) => (
                                    <th
                                        key={col}
                                        className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {applications.map((app) => {
                                const StatusIcon = statusConfig[app.status].icon;

                                return (
                                    <tr
                                        key={app.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        {/* Applicant */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                    {app.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white">
                                                        <User2 size={13} className="text-gray-400" />
                                                        {app.username}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {app.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Restaurant */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white">
                                                <Store size={14} className="text-gray-400 flex-shrink-0" />
                                                {app.resName}
                                            </div>
                                            {app.address && (
                                                <div className="flex items-start gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px]">
                                                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                                                    <span className="line-clamp-2">{app.address}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Contact */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {app.phone ? (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                                    <Phone size={13} className="text-gray-400" />
                                                    {app.phone}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </td>

                                        {/* Hours */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {app.openingTime && app.closingTime ? (
                                                <span>
                                                    {app.openingTime} – {app.closingTime}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusConfig[app.status].className}`}
                                                >
                                                    <StatusIcon size={12} />
                                                    {statusConfig[app.status].label}
                                                </span>
                                                {app.status === "REJECTED" && app.rejectionReason && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[180px] line-clamp-2">
                                                        {app.rejectionReason}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Submitted */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {app.createdAt
                                                ? new Date(app.createdAt).toLocaleDateString("vi-VN", {
                                                      day: "2-digit",
                                                      month: "2-digit",
                                                      year: "numeric",
                                                  })
                                                : "—"}
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {applications.length === 0 && (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                            <Store size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No applications found</p>
                            <p className="text-sm mt-1 opacity-70">
                                Try adjusting your search or filter.
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
}
