import api from "../axios";
import { User } from "@/types";
import { USE_MOCK } from "../config/mockRuntime";
import { mockUsers } from "@/mock-data/users";

type MockUser = (typeof mockUsers)[number];

const mapMockToUser = (mock: MockUser): User => ({
    id: mock.id,
    username: mock.name,
    email: mock.email,
    enabled: true,
    role: mock.role as User["role"],
    phone: null,
    avatar: mock.avatarUrl,
    createdAt: mock.createdAt,
    updatedAt: mock.createdAt,
});

export interface Address {
    id: string;
    userId: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export interface AddressData {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
}

export const userApi = {
    // Get user by ID
    getUserById: async (id: string) => {
        if (USE_MOCK) {
            const source: MockUser | undefined = mockUsers.find((u) => u.id === id);
            return mapMockToUser(source ?? mockUsers[0]);
        }
        const response = await api.get<User>(`/api/users/admin/${id}`);
        return response.data;
    },

    // Update user profile
    updateUserProfile: async (id: string, userData: Partial<User>) => {
        if (USE_MOCK) {
            const currentSource: MockUser | undefined = mockUsers.find((u) => u.id === id);
            const current = mapMockToUser(currentSource ?? mockUsers[0]);
            return { ...current, ...userData };
        }
        const response = await api.put<User>(`/api/users/profile/${id}`, userData);
        return response.data;
    },

    // Update password
    updatePassword: async (id: string, passwordData: { oldPassword: string; newPassword: string }) => {
        if (USE_MOCK) {
            const source: MockUser | undefined = mockUsers.find((u) => u.id === id);
            return mapMockToUser(source ?? mockUsers[0]);
        }
        const response = await api.put<User>(`/api/users/password/${id}`, passwordData);
        return response.data;
    },

    // Get user addresses
    getUserAddresses: async (userId: string) => {
        if (USE_MOCK) {
            return [] as Address[];
        }
        const response = await api.get<Address[]>(`/api/users/addresses/${userId}`);
        return response.data;
    },

    // Add address
    addAddress: async (userId: string, addressData: AddressData) => {
        if (USE_MOCK) {
            return {
                id: `mock-address-${Date.now()}`,
                userId,
                ...addressData,
                isDefault: addressData.isDefault ?? false,
            } as Address;
        }
        const response = await api.post<Address>(`/api/users/address/${userId}`, addressData);
        return response.data;
    },

    // Delete address
    deleteAddress: async (addressId: string) => {
        if (USE_MOCK) {
            return null;
        }
        const response = await api.delete(`/api/users/address/${addressId}`);
        return response.data;
    },
};
