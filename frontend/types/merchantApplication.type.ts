export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface MerchantApplication {
    id: string;
    userId: string;
    username: string;
    email: string;
    phone?: string | null;
    resName: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    openingTime?: string | null;
    closingTime?: string | null;
    status: ApplicationStatus;
    rejectionReason?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface RejectMerchantRequest {
    reason?: string;
}
