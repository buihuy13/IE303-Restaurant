export type PayoutRequestStatus = "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "REJECTED" | "FAILED";

export type WalletTransactionType = "EARN" | "WITHDRAW";
export type WalletTransactionStatus = "PENDING" | "COMPLETED" | "REJECTED" | "FAILED";
export type PayoutBatchStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface BankInfo {
    bankName: string;
    bankBin: string;
    accountNumber: string;
    accountHolderName: string;
}

export interface BankAccount extends BankInfo {
    id: string;
    defaultAccount: boolean;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface WalletSummary {
    id?: string;
    merchantId: string;
    restaurantId?: string;
    availableBalance: number;
    pendingWithdrawal: number;
    totalEarned: number;
    totalWithdrawn: number;
    /** Backward-compatible alias from backend: same value as availableBalance. */
    balance: number;
    defaultBankAccount?: BankAccount | null;
}

export interface WalletTransaction {
    id: string;
    type: WalletTransactionType;
    amount: number;
    status: WalletTransactionStatus;
    description?: string;
    createdAt: string;
}

export interface WalletTransactionsResponse {
    transactions: WalletTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PayoutRequest {
    id: string;
    walletId: string;
    merchantId: string;
    amount: number;
    bankInfo: BankInfo;
    note?: string;
    status: PayoutRequestStatus;
    rejectionReason?: string;
    processedByAdminId?: string;
    provider?: string;
    providerReferenceId?: string;
    providerPayoutId?: string;
    payoutBatchId?: string;
    processedAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface AdminPayoutRequestsResponse {
    requests: PayoutRequest[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PayoutBatch {
    id: string;
    status: PayoutBatchStatus;
    totalAmount: number;
    itemCount: number;
    requestedByAdminId: string;
    providerBatchId?: string;
    providerReferenceId?: string;
    createdAt?: string;
    completedAt?: string;
}

export interface PayoutAccountBalance {
    dryRun: boolean;
    enabled: boolean;
    accountNumber?: string;
    accountName?: string;
    currency?: string;
    balance?: string;
}
