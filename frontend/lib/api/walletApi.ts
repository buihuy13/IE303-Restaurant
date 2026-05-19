import api from "../axios";
import type {
    AdminPayoutRequestsResponse,
    BankInfo,
    BankAccount,
    PayoutAccountBalance,
    PayoutBatch,
    PayoutRequest,
    PayoutRequestStatus,
    WalletSummary,
    WalletTransactionsResponse,
} from "@/types/wallet.type";

type ApiSuccess<T> = {
    success: boolean;
    message?: string;
    data: T;
};

export const walletApi = {
    getWallet: () => api.get<ApiSuccess<WalletSummary>>("/wallets"),

    getTransactions: (params?: { page?: number; limit?: number }) =>
        api.get<ApiSuccess<WalletTransactionsResponse>>("/wallets/transactions", { params }),

    getBankAccounts: () => api.get<ApiSuccess<BankAccount[]>>("/wallets/bank-accounts"),

    createBankAccount: (payload: BankInfo & { defaultAccount?: boolean }) =>
        api.post<ApiSuccess<BankAccount>>("/wallets/bank-accounts", payload),

    updateBankAccount: (id: string, payload: BankInfo & { defaultAccount?: boolean }) =>
        api.put<ApiSuccess<BankAccount>>(`/wallets/bank-accounts/${id}`, payload),

    deleteBankAccount: (id: string) => api.delete<ApiSuccess<void>>(`/wallets/bank-accounts/${id}`),

    requestWithdraw: (payload: { amount: number; bankAccountId: string; note?: string }) =>
        api.post<ApiSuccess<PayoutRequest>>("/wallets/withdraw", payload),

    getPayoutRequests: (params?: {
        status?: PayoutRequestStatus;
        merchantId?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
    }) => api.get<ApiSuccess<AdminPayoutRequestsResponse>>("/admin/wallets/payout-requests", { params }),

    approvePayoutRequest: (id: string) =>
        api.post<ApiSuccess<PayoutRequest>>(`/admin/wallets/payout-requests/${id}/approve`),

    rejectPayoutRequest: (id: string, reason: string) =>
        api.post<ApiSuccess<PayoutRequest>>(`/admin/wallets/payout-requests/${id}/reject`, { reason }),

    retryPayoutRequest: (id: string) =>
        api.post<ApiSuccess<PayoutRequest>>(`/admin/wallets/payout-requests/${id}/retry`),

    createPayoutBatch: (payoutRequestIds: string[]) =>
        api.post<ApiSuccess<PayoutBatch>>("/admin/wallets/payout-batches", { payoutRequestIds }),

    getPayoutAccountBalance: () =>
        api.get<ApiSuccess<PayoutAccountBalance>>("/admin/wallets/payout-account/balance"),
};
