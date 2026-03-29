// eslint-disable @typescript-eslint/no-explicit-any
import { authApi } from "@/lib/api/authApi";
import {
    buildKeycloakLogoutUrl,
    exchangeCodeForTokens,
    refreshKeycloakToken,
    startKeycloakLogin,
} from "@/lib/auth/keycloak";
import { KEYCLOAK_BASE_URL, KEYCLOAK_CLIENT_ID, KEYCLOAK_REALM } from "@/lib/config/publicRuntime";
import { User } from "@/types";
import { create } from "zustand";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    // Effective role resolved from Keycloak access token (realm_access.roles).
    // This is the single source of truth for role-based routing in the frontend.
    authRole: "USER" | "MERCHANT" | "ADMIN" | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    isLoggingOut: boolean;

    // Actions
    loginWithKeycloak: (options?: {
        redirectPath?: string | null;
        idpHint?: "google" | "facebook";
        action?: "register";
    }) => Promise<void>;
    completeKeycloakLogin: (code: string, state: string) => Promise<{ success: boolean; redirectPath: string | null }>;
    register: (userData: {
        username: string;
        email: string;
        password: string;
        confirmPassword: string;
        role: string;
        phone: string;
    }) => Promise<boolean>;
    logout: (options?: { redirectToKeycloak?: boolean; postLogoutRedirectPath?: string }) => void;
    setTokens: (access: string | null, refresh: string | null, idToken?: string | null) => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (userData: { username: string; phone: string }) => Promise<boolean>;
    initializeAuth: () => Promise<void>;
    clearError: () => void;
}

const normalizeToken = (value: string | null): string | null => {
    if (!value) return null;
    const v = value.trim();
    if (!v || v === "null" || v === "undefined") return null;
    return v;
};

const getInitialTokens = (): { accessToken: string | null; refreshToken: string | null; idToken: string | null } => {
    if (typeof window !== "undefined") {
        const accessToken = normalizeToken(localStorage.getItem("accessToken"));
        const refreshToken = normalizeToken(localStorage.getItem("refreshToken"));
        const idToken = normalizeToken(localStorage.getItem("idToken"));
        return { accessToken, refreshToken, idToken };
    }
    return { accessToken: null, refreshToken: null, idToken: null };
};

/**
 * Decode a JWT and extract an effective application role from realm_access.roles.
 * Priority: ADMIN > MERCHANT > USER (default).
 */
const extractRoleFromAccessToken = (
    accessToken: string | null,
): "USER" | "MERCHANT" | "ADMIN" | null => {
    if (!accessToken) return null;

    try {
        const [, payload] = accessToken.split(".");
        if (!payload) return null;

        const json = JSON.parse(
            typeof atob === "function"
                ? atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
                : Buffer.from(payload, "base64").toString("utf8"),
        ) as {
            realm_access?: { roles?: string[] };
        };

        const roles = json.realm_access?.roles ?? [];
        if (roles.includes("ADMIN")) return "ADMIN";
        if (roles.includes("MERCHANT")) return "MERCHANT";
        return "USER";
    } catch {
        return null;
    }
};

/**
 * Decode a JWT access token into a minimal User profile for the UI.
 * We only rely on Keycloak standard claims (sub, preferred_username, email).
 */
const extractUserFromAccessToken = (accessToken: string | null): User | null => {
    if (!accessToken) return null;

    try {
        const [, payload] = accessToken.split(".");
        if (!payload) return null;

        const json = JSON.parse(
            typeof atob === "function"
                ? atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
                : Buffer.from(payload, "base64").toString("utf8"),
        ) as {
            sub?: string;
            preferred_username?: string;
            email?: string;
        };

        if (!json.sub) return null;

        const username = json.preferred_username || json.email || "User";

        // Note: other domain fields (addresses, status, etc.) still come from backend when needed.
        const minimalUser: User = {
            id: json.sub,
            username,
            email: json.email || "",
            role: "USER", // UI-level role comes from authRole; this field is kept for compatibility.
            // The rest of User fields (if any) will use TypeScript's optional properties.
        } as User;

        return minimalUser;
    } catch {
        return null;
    }
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: getInitialTokens().accessToken,
    refreshToken: getInitialTokens().refreshToken,
    idToken: getInitialTokens().idToken,
    authRole: extractRoleFromAccessToken(getInitialTokens().accessToken),
    isAuthenticated: !!getInitialTokens().accessToken,
    loading: false,
    error: null,
    isLoggingOut: false,

    setTokens: (access, refresh, idToken = null) => {
        // Set tokens and authentication state immediately
        const resolvedRole = extractRoleFromAccessToken(access);
        set({
            accessToken: access,
            refreshToken: refresh,
            idToken,
            authRole: resolvedRole,
            isAuthenticated: !!access,
        });
        if (typeof window !== "undefined") {
            if (access) {
                localStorage.setItem("accessToken", access);
            } else {
                localStorage.removeItem("accessToken");
            }
            if (refresh) {
                localStorage.setItem("refreshToken", refresh);
            } else {
                localStorage.removeItem("refreshToken");
            }
            if (idToken) {
                localStorage.setItem("idToken", idToken);
            } else {
                localStorage.removeItem("idToken");
            }
        }
    },

    loginWithKeycloak: async (options) => {
        set({ error: null });
        await startKeycloakLogin({
            baseUrl: KEYCLOAK_BASE_URL,
            realm: KEYCLOAK_REALM,
            clientId: KEYCLOAK_CLIENT_ID,
            redirectPath: options?.redirectPath ?? "/",
            idpHint: options?.idpHint,
            action: options?.action,
        });
    },

    completeKeycloakLogin: async (code, state) => {
        set({ loading: true, error: null });
        try {
            const tokenData = await exchangeCodeForTokens({
                baseUrl: KEYCLOAK_BASE_URL,
                realm: KEYCLOAK_REALM,
                clientId: KEYCLOAK_CLIENT_ID,
                code,
                state,
            });

            get().setTokens(tokenData.accessToken, tokenData.refreshToken, tokenData.idToken);
            await get().fetchProfile();
            set({ loading: false });

            return { success: true, redirectPath: tokenData.redirectPath };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to complete Keycloak login.";
            set({ error: message, loading: false, isAuthenticated: false });
            return { success: false, redirectPath: null };
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            await authApi.register(userData);
            set({ loading: false });

            return true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Registration failed";
            set({ error: errorMessage, loading: false });
            return false;
        }
    },

    fetchProfile: async () => {
        const accessToken = get().accessToken;
        // Nếu không có token thì xem như guest.
        if (!accessToken) {
            set({ user: null, isAuthenticated: false, loading: false });
            return;
        }

        try {
            // Ưu tiên đồng bộ user đầy đủ từ backend theo access token vừa login.
            const userFromToken = await authApi.getUserByToken();
            const resolvedRole = get().authRole ?? userFromToken.role ?? "USER";
            set({
                user: {
                    ...userFromToken,
                    role: resolvedRole,
                },
                error: null,
                isAuthenticated: !!accessToken,
                loading: false,
            });
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number } };
            const status = axiosErr?.response?.status;

            if (status === 401) {
                // Access token expired: try refresh explicitly.
                // If we don't have refreshToken or refresh fails => logout.
                if (typeof window === "undefined") {
                    get().logout();
                    return;
                }

                const refreshToken = normalizeToken(localStorage.getItem("refreshToken"));
                if (!refreshToken) {
                    get().logout();
                    return;
                }

                try {
                    const refreshed = await authApi.refreshAccessToken(refreshToken);
                    get().setTokens(refreshed.accessToken, refreshed.refreshToken, refreshed.idToken);

                    // Retry fetch profile with the refreshed access token.
                    const userFromToken = await authApi.getUserByToken();
                    const resolvedRole = get().authRole ?? userFromToken.role ?? "USER";
                    set({
                        user: {
                            ...userFromToken,
                            role: resolvedRole,
                        },
                        error: null,
                        isAuthenticated: true,
                        loading: false,
                    });
                    return;
                } catch {
                    get().logout();
                    return;
                }
            }

            // Fallback: backend tạm thời lỗi => vẫn giữ trải nghiệm đăng nhập bằng JWT claims.
            const minimalUser = extractUserFromAccessToken(accessToken);
            const resolvedRole = get().authRole ?? minimalUser?.role ?? "USER";
            set({
                user: minimalUser
                    ? {
                          ...minimalUser,
                          role: resolvedRole,
                      }
                    : null,
                error: null,
                isAuthenticated: !!accessToken,
                loading: false,
            });
        }
    },

    updateProfile: async (userData) => {
        if (!get().user?.id) {
            return false;
        }
        set({ loading: true, error: null });
        try {
            const updatedUser = await authApi.updateUser(get().user!.id, userData);
            set({ user: updatedUser, loading: false });
            return true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to update profile";
            set({ error: errorMessage, loading: false });
            return false;
        }
    },

    logout: (options) => {
        const redirectToKeycloak = !!options?.redirectToKeycloak;
        const postLogoutRedirectPath = options?.postLogoutRedirectPath ?? "/";
        const currentIdToken = get().idToken;

        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            authRole: null,
            isAuthenticated: false,
            error: null,
            loading: false,
            isLoggingOut: true,
        });
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("idToken");
            if (redirectToKeycloak) {
                try {
                    const postLogoutRedirectUri = `${window.location.origin}${postLogoutRedirectPath}`;
                    const logoutUrl = buildKeycloakLogoutUrl({
                        baseUrl: KEYCLOAK_BASE_URL,
                        realm: KEYCLOAK_REALM,
                        clientId: KEYCLOAK_CLIENT_ID,
                        postLogoutRedirectUri,
                        idTokenHint: currentIdToken,
                    });
                    window.location.assign(logoutUrl);
                    return;
                } catch (error) {
                    console.error("Failed to build Keycloak logout URL:", error);
                }
            }
            // Reset isLoggingOut after a short delay
            setTimeout(() => {
                set({ isLoggingOut: false });
            }, 2000);
        }
    },

    initializeAuth: async () => {
        // Quick check - if no access token, skip immediately (guest mode)
        const { accessToken, refreshToken, idToken } = getInitialTokens();
        if (!accessToken) {
            if (refreshToken) {
                try {
                    const refreshed = await refreshKeycloakToken({
                        baseUrl: KEYCLOAK_BASE_URL,
                        realm: KEYCLOAK_REALM,
                        clientId: KEYCLOAK_CLIENT_ID,
                        refreshToken,
                    });
                    const resolvedRole = extractRoleFromAccessToken(refreshed.accessToken);
                    set({
                        accessToken: refreshed.accessToken,
                        refreshToken: refreshed.refreshToken,
                        idToken: refreshed.idToken || idToken,
                        authRole: resolvedRole,
                        isAuthenticated: true,
                        loading: true,
                    });
                    await get().fetchProfile();
                    return;
                } catch {
                    // Ignore refresh initialization error and continue as guest.
                }
            }

            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                idToken: null,
                isAuthenticated: false,
                loading: false,
            });
            return;
        }

        // Set tokens + role immediately for faster UI response
        const resolvedRole = extractRoleFromAccessToken(accessToken);
        set({ accessToken, refreshToken, idToken, authRole: resolvedRole, isAuthenticated: true, loading: true });

        try {
            // Fetch user profile in background - don't block if it fails
            // Use Promise.race with timeout to prevent hanging
            const profilePromise = get().fetchProfile();
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error("Profile fetch timeout")), 10000);
            });

            await Promise.race([profilePromise, timeoutPromise]);
        } catch (err) {
            // Silently handle errors - fetchProfile already handles cleanup
            // Check if it's a timeout error
            const isTimeout = err instanceof Error && err.message === "Profile fetch timeout";

            // Check if it's a network error (backend not accessible)
            const axiosError = err as { code?: string; message?: string; response?: unknown };
            const isNetworkError =
                axiosError.code === "ERR_NETWORK" || axiosError.message === "Network Error" || !axiosError.response;

            // Only log errors that have a response from server (not network/infrastructure errors)
            // Network errors usually mean backend is not running - this is expected in some cases
            if (process.env.NODE_ENV === "development" && !isTimeout && !isNetworkError) {
                console.error("Error during auth initialization:", err);
            }

            // Ensure loading is cleared
            const currentState = get();
            if (currentState.loading) {
                set({ loading: false });
            }

            // If timeout or network error, don't clear tokens - might just be backend not running
            // fetchProfile will handle invalid token cleanup
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));
