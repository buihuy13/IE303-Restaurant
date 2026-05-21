/**
 * Admin API for Merchant Application management.
 * Endpoints: GET/PUT /api/users/admin/merchants/**
 */
import type { MerchantApplication, ApplicationStatus } from "@/types";
import api from "../axios";

export const merchantApplicationApi = {
    /**
     * GET /api/users/admin/merchants?status=PENDING|APPROVED|REJECTED
     * Returns all merchant applications, optionally filtered by status.
     */
    getApplications: async (status?: ApplicationStatus): Promise<MerchantApplication[]> => {
        const params = status ? { status } : {};
        const response = await api.get<MerchantApplication[]>("/users/admin/merchants", { params });
        return response.data;
    },

    /**
     * PUT /api/users/admin/merchants/{id}/approve
     * Approves a pending merchant application.
     */
    approveApplication: async (id: string): Promise<MerchantApplication> => {
        const response = await api.put<MerchantApplication>(`/users/admin/merchants/${id}/approve`);
        return response.data;
    },

    /**
     * PUT /api/users/admin/merchants/{id}/reject
     * Rejects a pending merchant application with an optional reason.
     */
    rejectApplication: async (id: string, reason?: string): Promise<MerchantApplication> => {
        const response = await api.put<MerchantApplication>(`/users/admin/merchants/${id}/reject`, {
            reason,
        });
        return response.data;
    },
};
