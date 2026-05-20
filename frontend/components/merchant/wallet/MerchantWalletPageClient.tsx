"use client";

import { walletApi } from "@/lib/api/walletApi";
import { formatDateTime } from "@/lib/formatters";
import type { BankAccount, BankInfo, WalletSummary, WalletTransaction } from "@/types/wallet.type";
import { Building2, Loader2, Plus, Trash2, Wallet as WalletIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value || 0);

const emptyBankForm: BankInfo = {
    bankName: "",
    bankBin: "",
    accountNumber: "",
    accountHolderName: "",
};

export default function MerchantWalletPageClient() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [wallet, setWallet] = useState<WalletSummary | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [selectedBankAccountId, setSelectedBankAccountId] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [amount, setAmount] = useState<number>(50000);
    const [bankForm, setBankForm] = useState<BankInfo>(emptyBankForm);
    const [editingBankId, setEditingBankId] = useState<string | null>(null);
    const [note, setNote] = useState("");

    const canSubmitBank = useMemo(() => {
        if (submitting) return false;
        return Boolean(
            bankForm.bankName.trim() &&
            bankForm.bankBin.trim() &&
            bankForm.accountNumber.trim() &&
            bankForm.accountHolderName.trim()
        );
    }, [bankForm, submitting]);

    const canSubmitWithdraw = useMemo(() => {
        if (submitting) return false;
        if (!amount || amount < 1) return false;
        if (!selectedBankAccountId) return false;
        if ((wallet?.availableBalance ?? 0) < amount) return false;
        return true;
    }, [amount, selectedBankAccountId, submitting, wallet?.availableBalance]);

    const fetchAll = useCallback(async (nextPage: number) => {
        try {
            setLoading(true);
            const [walletRes, txRes, bankRes] = await Promise.all([
                walletApi.getWallet(),
                walletApi.getTransactions({ page: nextPage, limit: 20 }),
                walletApi.getBankAccounts(),
            ]);

            const banks = bankRes.data.data;
            setWallet(walletRes.data.data);
            setTransactions(txRes.data.data.transactions);
            setBankAccounts(banks);
            setTotalPages(txRes.data.data.pagination.totalPages || 1);
            setSelectedBankAccountId((current) => current || banks.find((bank) => bank.defaultAccount)?.id || banks[0]?.id || "");
        } catch (error) {
            console.error("Failed to load wallet:", error);
            toast.error("Unable to load wallet data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll(page);
    }, [fetchAll, page]);

    const resetBankForm = () => {
        setEditingBankId(null);
        setBankForm(emptyBankForm);
    };

    const handleSaveBank = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmitBank) return;

        try {
            setSubmitting(true);
            const payload = {
                bankName: bankForm.bankName.trim(),
                bankBin: bankForm.bankBin.trim(),
                accountNumber: bankForm.accountNumber.trim(),
                accountHolderName: bankForm.accountHolderName.trim(),
                defaultAccount: bankAccounts.length === 0,
            };
            if (editingBankId) {
                await walletApi.updateBankAccount(editingBankId, payload);
                toast.success("Bank account updated");
            } else {
                await walletApi.createBankAccount(payload);
                toast.success("Bank account added");
            }
            resetBankForm();
            await fetchAll(page);
        } catch (error: unknown) {
            console.error("Save bank failed:", error);
            toast.error(readErrorMessage(error) || "Unable to save bank account");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetDefault = async (bank: BankAccount) => {
        try {
            await walletApi.updateBankAccount(bank.id, { ...bank, defaultAccount: true });
            await fetchAll(page);
        } catch (error) {
            console.error("Set default bank failed:", error);
            toast.error("Unable to set default bank account");
        }
    };

    const handleDeleteBank = async (id: string) => {
        try {
            await walletApi.deleteBankAccount(id);
            if (selectedBankAccountId === id) setSelectedBankAccountId("");
            await fetchAll(page);
        } catch (error) {
            console.error("Delete bank failed:", error);
            toast.error("Unable to delete bank account");
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmitWithdraw) return;

        try {
            setSubmitting(true);
            await walletApi.requestWithdraw({
                amount,
                bankAccountId: selectedBankAccountId,
                note: note.trim() || undefined,
            });
            toast.success("Withdrawal request submitted");
            setNote("");
            setAmount(50000);
            await fetchAll(1);
            setPage(1);
        } catch (error: unknown) {
            console.error("Withdraw failed:", error);
            toast.error(readErrorMessage(error) || "Unable to submit withdrawal request");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !wallet) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-brand-orange" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Restaurant Wallet</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Track revenue and payout requests</p>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <WalletIcon className="h-5 w-5" />
                    <span className="font-semibold">{formatVND(wallet?.availableBalance ?? 0)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard label="Available Balance" value={formatVND(wallet?.availableBalance ?? 0)} />
                <MetricCard label="Pending Withdrawal" value={formatVND(wallet?.pendingWithdrawal ?? 0)} tone="amber" />
                <MetricCard label="Total Earned" value={formatVND(wallet?.totalEarned ?? 0)} tone="green" />
                <MetricCard label="Total Withdrawn" value={formatVND(wallet?.totalWithdrawn ?? 0)} tone="blue" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bank Accounts</h2>
                            <Building2 className="h-5 w-5 text-gray-500" />
                        </div>

                        <div className="space-y-3">
                            {bankAccounts.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No bank account yet</p>
                            ) : (
                                bankAccounts.map((bank) => (
                                    <div
                                        key={bank.id}
                                        className="rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {bank.bankName} {bank.defaultAccount ? "(Default)" : ""}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {bank.bankBin} • {bank.accountNumber}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {bank.accountHolderName}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteBank(bank.id)}
                                                className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                title="Delete bank account"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingBankId(bank.id);
                                                    setBankForm(bank);
                                                }}
                                                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-sm"
                                            >
                                                Edit
                                            </button>
                                            {!bank.defaultAccount && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetDefault(bank)}
                                                    className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-sm"
                                                >
                                                    Set default
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <form className="mt-5 space-y-3" onSubmit={handleSaveBank}>
                            <Input label="Bank Name" value={bankForm.bankName} onChange={(value) => setBankForm((prev) => ({ ...prev, bankName: value }))} />
                            <Input label="Bank BIN" value={bankForm.bankBin} onChange={(value) => setBankForm((prev) => ({ ...prev, bankBin: value }))} />
                            <Input label="Account Number" value={bankForm.accountNumber} onChange={(value) => setBankForm((prev) => ({ ...prev, accountNumber: value }))} />
                            <Input label="Account Holder Name" value={bankForm.accountHolderName} onChange={(value) => setBankForm((prev) => ({ ...prev, accountHolderName: value }))} />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={!canSubmitBank}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-orange text-white font-semibold disabled:bg-gray-200 disabled:text-gray-500"
                                >
                                    <Plus className="h-4 w-4" />
                                    {editingBankId ? "Update Bank" : "Add Bank"}
                                </button>
                                {editingBankId && (
                                    <button
                                        type="button"
                                        onClick={resetBankForm}
                                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Withdrawal Request</h2>
                        <form className="space-y-4" onSubmit={handleWithdraw}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Bank Account
                                </label>
                                <select
                                    value={selectedBankAccountId}
                                    onChange={(e) => setSelectedBankAccountId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                                >
                                    <option value="">Select bank account</option>
                                    {bankAccounts.map((bank) => (
                                        <option key={bank.id} value={bank.id}>
                                            {bank.bankName} - {bank.accountNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Amount (VND)"
                                type="number"
                                min={1}
                                value={amount}
                                onChange={(value) => setAmount(Number(value))}
                            />
                            <Input label="Note" value={note} onChange={setNote} />
                            <button
                                type="submit"
                                disabled={!canSubmitWithdraw}
                                className="w-full px-4 py-2 rounded-lg bg-brand-orange text-white font-semibold disabled:bg-gray-200 disabled:text-gray-500"
                            >
                                {submitting ? "Submitting..." : "Submit Request"}
                            </button>
                        </form>
                    </section>
                </div>

                <section className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transactions</h2>
                        <div className="flex items-center gap-2">
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

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <TableHeader>Time</TableHeader>
                                    <TableHeader>Type</TableHeader>
                                    <TableHeader>Amount</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Description</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No transactions yet
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <TableCell>{tx.createdAt ? formatDateTime(tx.createdAt) : ""}</TableCell>
                                            <TableCell>{tx.type === "EARN" ? "Revenue" : "Withdrawal"}</TableCell>
                                            <TableCell>
                                                <span className={tx.amount >= 0 ? "text-green-600" : "text-red-600"}>
                                                    {tx.amount >= 0 ? "+" : "-"}
                                                    {formatVND(Math.abs(tx.amount))}
                                                </span>
                                            </TableCell>
                                            <TableCell>{tx.status}</TableCell>
                                            <TableCell>{tx.description || ""}</TableCell>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

function MetricCard({ label, value, tone = "gray" }: { label: string; value: string; tone?: "gray" | "green" | "blue" | "amber" }) {
    const toneClass =
        tone === "green" ? "text-green-600" : tone === "blue" ? "text-blue-600" : tone === "amber" ? "text-amber-600" : "text-gray-900 dark:text-white";
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${toneClass}`}>{value}</p>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
    min,
}: {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: string;
    min?: number;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input
                type={type}
                min={min}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
        </div>
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
    return <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{children}</td>;
}

function readErrorMessage(error: unknown): string | undefined {
    if (error && typeof error === "object" && "response" in error) {
        return (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    }
    return undefined;
}
