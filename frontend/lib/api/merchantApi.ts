import { Merchant } from "@/types";
import { authApi } from "./authApi";

export const merchantApi = {
    // Get all merchants (Admin only)
    getAllMerchants: async () => {
        const usersPage = await authApi.getAllUsers({ page: 0, size: 1000 });
        const users = Array.isArray(usersPage?.content) ? usersPage.content : [];

        return users
            .filter((u) => u.role === "MERCHANT")
            .map(
                (u): Merchant => ({
                    ...u,
                    role: "MERCHANT",
                    status: u.enabled ? "APPROVED" : "PENDING",
                    totalRestaurants: 0,
                    totalRevenue: 0,
                }),
            );
    },

    // Get merchant by ID
    getMerchantById: async (merchantId: string) => {
        const user = await authApi.getUserById(merchantId);
        if (!user || user.role !== "MERCHANT") return undefined;
        return {
            ...user,
            role: "MERCHANT",
            status: user.enabled ? "APPROVED" : "PENDING",
            totalRestaurants: 0,
            totalRevenue: 0,
        };
    },

    // Manager creation endpoint is not available in current restaurant-service API.
};
