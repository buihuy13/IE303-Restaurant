"use client";

import { walletApi } from "@/lib/api/walletApi";
import { formatDateTime } from "@/lib/formatters";
import type { PayoutAccountBalance, PayoutRequest, PayoutRequestStatus } from "@/types/wallet.type";
import { Check, Loader2, RefreshCcw, Send, Wallet, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const statuses: Array<"ALL" | PayoutRequestStatus> = [
    "ALL",
    "PENDING",
    "APPROVED",
    "PROCESSING",
    "COMPLETED",
    "REJECTED",
    "FAILED",
];

const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value || 0);

export default function AdminPayoutPageClient() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState<PayoutRequest[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [status, setStatus] = useState<"ALL" | PayoutRequestStatus>("PENDING");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [balance, setBalance] = useState<PayoutAccountBalance | null>(null);

    const selectedApprovedIds = useMemo(
        () => requests.filter((request) => selectedIds.includes(request.id) && request.status === "APPROVED").map((request) => request.id),
        [requests, selectedIds],
    );

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const [requestsRes, balanceRes] = await Promise.all([
                walletApi.getPayoutRequests({
                    status: status === "ALL" ? undefined : status,
                    page,
                    limit: 20,
                }),
                walletApi.getPayoutAccountBalance(),
            ]);
            setRequests(requestsRes.data.data.requests);
            setTotalPages(requestsRes.data.data.pagination.totalPages || 1);
            setBalance(balanceRes.data.data);
            setSelectedIds([]);
        } catch (error) {
            console.error("Failed to load payout requests:", error);
            toast.error("Unable to load payout requests");
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const approve = async (id: string) => {
        await runAction(async () => {
            await walletApi.approvePayoutRequest(id);
            toast.success("Payout request approved");
        });
    };

    const reject = async (id: string) => {
        const reason = window.prompt("Rejection reason");
        if (!reason?.trim()) return;
        await runAction(async () => {
            await walletApi.rejectPayoutRequest(id, reason.trim());
            toast.success("Payout request rejected");
        });
    };

    const retry = async (id: string) => {
        await runAction(async () => {
            await walletApi.retryPayoutRequest(id);
            toast.success("Payout request retried");
        });
    };

    const createBatch = async () => {
        if (selectedApprovedIds.length === 0) return;
        await runAction(async () => {
            const res = await walletApi.createPayoutBatch(selectedApprovedIds);
            toast.success(`Payout batch ${res.data.data.status.toLowerCase()}`);
        });
    };

    const runAction = async (action: () => Promise<void>) => {
        try {
            setSubmitting(true);
            await action();
            await fetchAll();
        } catch (error: unknown) {
            console.error("Payout action failed:", error);
            toast.error(readErrorMessage(error) || "Payout action failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Wallet Payouts</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Review merchant withdrawals and process PayOS batches</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {balance?.dryRun && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                            DRY RUN
                        </span>
                    )}
                    <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                        <Wallet className="h-4 w-4" />
                        <span>{balance?.balance || "N/A"} {balance?.currency || ""}</span>
                    </div>
                    <button
                        type="button"
                        onClick={fetchAll}
                        className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700"
                        title="Refresh"
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                    {statuses.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => {
                                setStatus(item);
                                setPage(1);
                            }}
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                status === item
                                    ? "bg-brand-orange text-white"
                                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    disabled={selectedApprovedIds.length === 0 || submitting}
                    onClick={createBatch}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 py-2 font-semibold text-white disabled:bg-gray-200 disabled:text-gray-500"
                >
                    <Send className="h-4 w-4" />
                    Process Batch ({selectedApprovedIds.length})
                </button>
            </div>

            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-brand-orange" size={36} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <TableHeader>Select</TableHeader>
                                    <TableHeader>Created</TableHeader>
                                    <TableHeader>Merchant</TableHeader>
                                    <TableHeader>Amount</TableHeader>
                                    <TableHeader>Bank</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                            No payout requests
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    disabled={request.status !== "APPROVED"}
                                                    checked={selectedIds.includes(request.id)}
                                                    onChange={(e) =>
                                                        setSelectedIds((current) =>
                                                            e.target.checked
                                                                ? [...current, request.id]
                                                                : current.filter((id) => id !== request.id),
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>{request.createdAt ? formatDateTime(request.createdAt) : ""}</TableCell>
                                            <TableCell>{request.merchantId}</TableCell>
                                            <TableCell>
                                                <span className="font-semibold">{formatVND(request.amount)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-60">
                                                    <p className="font-medium">{request.bankInfo.bankName}</p>
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        {request.bankInfo.bankBin} • {request.bankInfo.accountNumber}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={request.status} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {request.status === "PENDING" && (
                                                        <IconButton title="Approve" onClick={() => approve(request.id)} disabled={submitting}>
                                                            <Check className="h-4 w-4" />
                                                        </IconButton>
                                                    )}
                                                    {["PENDING", "APPROVED", "FAILED"].includes(request.status) && (
                                                        <IconButton title="Reject" onClick={() => reject(request.id)} disabled={submitting}>
                                                            <X className="h-4 w-4" />
                                                        </IconButton>
                                                    )}
                                                    {request.status === "FAILED" && (
                                                        <IconButton title="Retry" onClick={() => retry(request.id)} disabled={submitting}>
                                                            <RefreshCcw className="h-4 w-4" />
                                                        </IconButton>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <div className="flex items-center justify-end gap-2">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-sm disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {page} / {totalPages}
                </span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-sm disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: PayoutRequestStatus }) {
    const className =
        status === "COMPLETED"
            ? "bg-green-100 text-green-700"
            : status === "FAILED" || status === "REJECTED"
              ? "bg-red-100 text-red-700"
              : status === "PROCESSING"
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700";
    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

function IconButton({
    children,
    title,
    onClick,
    disabled,
}: {
    children: React.ReactNode;
    title: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
        >
            {children}
        </button>
    );
}

function TableHeader({ children }: { children: React.ReactNode }) {
    return (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            {children}
        </th>
    );
}

function TableCell({ children }: { children: React.ReactNode }) {
    return <td className="px-6 py-4 align-top text-sm text-gray-700 dark:text-gray-200">{children}</td>;
}

function readErrorMessage(error: unknown): string | undefined {
    if (error && typeof error === "object" && "response" in error) {
        return (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    }
    return undefined;
}
