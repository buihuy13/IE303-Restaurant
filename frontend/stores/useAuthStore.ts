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
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    isLoggingOut: boolean;

    // Actions
    login: (credentials: { username: string; password: string }) => Promise<boolean>;
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
    }) => Promise<boolean>;
    logout: (options?: { redirectToKeycloak?: boolean; postLogoutRedirectPath?: string }) => void;
    setTokens: (access: string | null, refresh: string | null, idToken?: string | null) => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (userData: { username: string; phone: string }) => Promise<boolean>;
    initializeAuth: () => Promise<void>;
    clearError: () => void;
    resendVerificationEmail: (email: string) => Promise<boolean>;
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

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: getInitialTokens().accessToken,
    refreshToken: getInitialTokens().refreshToken,
    idToken: getInitialTokens().idToken,
    isAuthenticated: !!getInitialTokens().accessToken,
    loading: false,
    error: null,
    isLoggingOut: false,

    setTokens: (access, refresh, idToken = null) => {
        // Set tokens and authentication state immediately
        set({
            accessToken: access,
            refreshToken: refresh,
            idToken,
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

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const { accessToken } = await authApi.login(credentials);
            // Set tokens first to mark as authenticated immediately
            get().setTokens(accessToken, null);
            // Fetch profile in background - don't block login success
            // Use Promise.race with timeout to prevent hanging
            const profilePromise = get().fetchProfile();
            const timeoutPromise = new Promise<void>((resolve) => {
                setTimeout(() => resolve(), 5000); // 5 second timeout
            });
            try {
                await Promise.race([profilePromise, timeoutPromise]);
            } catch (profileError) {
                // Log but don't fail login if profile fetch fails
                console.warn("Profile fetch failed during login:", profileError);
            }
            set({ loading: false });
            return true;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const errorCode = err.response?.data?.errorCode;
            const errorMessage = err.response?.data?.message || err.message || "Login failed";

            // Store error code and message for handling
            set({
                error: errorCode ? `${errorCode}: ${errorMessage}` : errorMessage,
                loading: false,
                isAuthenticated: false,
            });

            // Re-throw error so login page can handle INACTIVATED_ACCOUNT specifically
            if (errorCode === "INACTIVATED_ACCOUNT") {
                throw err;
            }

            return false;
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
        // Check token directly instead of isAuthenticated flag
        if (!accessToken) {
            set({ user: null, isAuthenticated: false, loading: false });
            return;
        }
        try {
            // Use getUserByAccessToken endpoint which extracts user from token automatically
            const userData = await authApi.getUserByAccessToken();
            set({ user: userData, error: null, isAuthenticated: true, loading: false });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            // Check if it's a timeout error
            const isTimeout = err.code === "ECONNABORTED" || err.message?.includes("timeout");

            // Check if it's a network error (backend not accessible)
            const isNetworkError = err.code === "ERR_NETWORK" || err.message === "Network Error" || !err.response;

            // Only log errors that have a response from server (not network/infrastructure errors)
            // Network errors usually mean backend is not running or not accessible
            if (!isTimeout && !isNetworkError && err.response) {
                console.error("Failed to fetch user profile:", err);
            }

            // For timeout or network errors, don't clear tokens - might just be backend not running
            // Only clear tokens for actual authentication errors (401, 403)
            const isAuthError = err.response?.status === 401 || err.response?.status === 403;

            if (isAuthError && !isTimeout && !isNetworkError) {
                // If token is invalid, clear everything
                set({
                    error: "Failed to load user profile.",
                    user: null,
                    isAuthenticated: false,
                    loading: false,
                    idToken: null,
                });
                // Clear invalid tokens
                if (typeof window !== "undefined") {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("idToken");
                }
            } else {
                // For timeout, network errors, or other errors, just set loading to false
                // Keep tokens and authentication state (might be valid, just backend not accessible)
                set({ loading: false });
            }
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
                    set({
                        accessToken: refreshed.accessToken,
                        refreshToken: refreshed.refreshToken,
                        idToken: refreshed.idToken || idToken,
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

        // Set tokens immediately for faster UI response
        set({ accessToken, refreshToken, idToken, isAuthenticated: true, loading: true });

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

    resendVerificationEmail: async (email: string) => {
        set({ loading: true, error: null });
        try {
            await authApi.resendVerificationEmail(email);
            set({ loading: false, error: null });
            return true;
        } catch (err) {
            console.error("Resend verification email error:", err);
            let errorMessage = "Failed to send verification email";

            if (err && typeof err === "object" && "response" in err) {
                const axiosError = err as {
                    response?: {
                        status?: number;
                        data?: { message?: string; errorCode?: string };
                    };
                };

                console.error("Axios error details:", {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data,
                });

                errorMessage = axiosError.response?.data?.message || errorMessage;

                // Handle specific error cases
                if (
                    axiosError.response?.data?.errorCode === "USER_NOT_FOUND" ||
                    errorMessage.toLowerCase().includes("not found") ||
                    errorMessage.toLowerCase().includes("user not found")
                ) {
                    errorMessage = "Email not found. Please check your email address.";
                } else if (
                    errorMessage.toLowerCase().includes("already activated") ||
                    errorMessage.toLowerCase().includes("account is already")
                ) {
                    errorMessage = "This account is already activated. You can log in now.";
                } else if (axiosError.response?.status === 404) {
                    errorMessage = "Email not found. Please check your email address.";
                } else if (axiosError.response?.status === 400) {
                    errorMessage = errorMessage || "Invalid request. Please check your email address.";
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            set({ error: errorMessage, loading: false });
            return false;
        }
    },
}));
