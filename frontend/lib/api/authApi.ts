import { AddressRequest, PageableResponse, User } from "@/types";
import { refreshKeycloakToken } from "../auth/keycloak";
import api from "../axios";
import { KEYCLOAK_BASE_URL, KEYCLOAK_CLIENT_ID, KEYCLOAK_REALM } from "../config/publicRuntime";

const looksLikeUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

interface RegisterResponse {
    message: string;
}

interface UserUpdateRequest {
    username: string;
    phone: string;
}

interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    phone: string;
}

interface UserPayload {
    id: string;
    username?: string;
    email?: string;
    phone?: string | null;
    role?: string;
    enabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface AddressResponse {
    id: string;
    location: string;
    longitude: number;
    latitude: number;
}

const toUserRole = (role?: string): User["role"] => {
    const value = (role || "").toUpperCase();
    if (value === "ADMIN" || value === "MERCHANT" || value === "MANAGER" || value === "USER") {
        return value;
    }
    return "USER";
};

const normalizeUser = (user: UserPayload): User => ({
    id: user.id,
    username: user.username || "Unknown",
    email: user.email || "",
    phone: user.phone ?? null,
    enabled: user.enabled ?? true,
    role: toUserRole(user.role),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const normalizeUserPage = (page: PageableResponse<UserPayload>): PageableResponse<User> => ({
    ...page,
    content: Array.isArray(page.content) ? page.content.map(normalizeUser) : [],
});

export const authApi = {
    register: async (userData: RegisterRequest) => {
        const response = await api.post<RegisterResponse>("/users/register", userData);
        return response.data;
    },

    refreshAccessToken: async (refreshToken: string) => {
        const refreshed = await refreshKeycloakToken({
            baseUrl: KEYCLOAK_BASE_URL,
            realm: KEYCLOAK_REALM,
            clientId: KEYCLOAK_CLIENT_ID,
            refreshToken,
        });
        return refreshed;
    },

    getAllUsers: async (params?: { page?: number; size?: number; sort?: string }) => {
        const response = await api.get<PageableResponse<UserPayload>>("/users", {
            params,
        });
        return normalizeUserPage(response.data);
    },
    getUserById: async (id: string) => {
        if (!id || !looksLikeUuid(id)) {
            return null;
        }
        const response = await api.get<UserPayload>(`/users/admin/${id}`);
        return normalizeUser(response.data);
    },
    getUserBySlug: async (slug: string) => {
        const response = await api.get<UserPayload>(`/users/${slug}`);
        return normalizeUser(response.data);
    },
    getUserByToken: async () => {
        const response = await api.get<UserPayload>("/users/accesstoken");
        return normalizeUser(response.data);
    },
    updateUser: async (id: string, userData: UserUpdateRequest) => {
        const response = await api.put<UserPayload>(`/users/${id}`, userData);
        return normalizeUser(response.data);
    },
    deleteUser: async (id: string) => {
        const response = await api.delete<{ message: string }>(`/users/${id}`);
        return response.data;
    },

    addAddress: async (userId: string, address: AddressRequest) => {
        const response = await api.post<AddressResponse>("/users/address", {
            userId,
            ...address,
        });
        return response.data;
    },
    deleteAddress: async (addressId: string) => {
        const response = await api.delete<{ message: string }>(`/users/address/${addressId}`);
        return response.data;
    },
    getUserAddresses: async (userId: string) => {
        const response = await api.get<AddressResponse[]>(`/users/addresses/${userId}`);
        return response.data.map((addr) => ({
            id: addr.id,
            location: addr.location,
            longitude: addr.longitude,
            latitude: addr.latitude,
        }));
    },
};
