/**
 * Raw token payload returned by Keycloak's /token endpoint.
 * We keep the original field names (snake_case) to match the HTTP response.
 */
type KeycloakTokenResponse = {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in: number;
    refresh_expires_in?: number;
    token_type: string;
    scope?: string;
};

/**
 * Small object we persist in sessionStorage while the browser is on Keycloak.
 * Holds PKCE verifier + state + the client redirect path so that the callback
 * (/login-success) can safely exchange the authorization code.
 */
type AuthTransaction = {
    state: string;
    codeVerifier: string;
    redirectPath: string | null;
    createdAt: number;
};

/**
 * Normalised token bundle that the rest of the app uses after a successful
 * authorization-code exchange.
 */
export type KeycloakExchangeResult = {
    accessToken: string;
    refreshToken: string | null;
    idToken: string | null;
    redirectPath: string | null;
};

// sessionStorage key + safe default redirect after login.
const AUTH_TXN_STORAGE_KEY = "keycloak_auth_transaction";
const REDIRECT_PATH_FALLBACK = "/";

// Remove trailing slashes so we don't accidentally generate URLs with `//`.
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

// Browser-safe Base64URL encoding helper used by PKCE utilities below.
const toBase64Url = (bytes: Uint8Array) =>
    btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

// Generate a cryptographically-strong random string for state / code_verifier.
const randomString = (length = 64) => {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return toBase64Url(bytes);
};

// Compute SHA-256 hash for PKCE `code_challenge`.
const sha256 = async (value: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(digest);
};

// Persist the current auth transaction in sessionStorage before redirecting
// to Keycloak. Cleared automatically after a successful / failed exchange.
const saveAuthTransaction = (txn: AuthTransaction) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(AUTH_TXN_STORAGE_KEY, JSON.stringify(txn));
};

// Read and validate an auth transaction from sessionStorage.
// Returns null if parsing fails or the shape is invalid.
const readAuthTransaction = (): AuthTransaction | null => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(AUTH_TXN_STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as AuthTransaction;
        if (!parsed?.state || !parsed?.codeVerifier) return null;
        return parsed;
    } catch {
        return null;
    }
};

// Remove any stored auth transaction (used on success or fatal error).
const clearAuthTransaction = () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(AUTH_TXN_STORAGE_KEY);
};

// Guard to fail fast if Keycloak env variables are missing / misconfigured.
const ensureConfigured = (baseUrl: string, realm: string, clientId: string) => {
    if (!baseUrl || !realm || !clientId) {
        throw new Error("Keycloak is not configured. Please set Keycloak env variables.");
    }
};

// Base URL for all OIDC endpoints of a realm (auth, token, logout, ...).
const createOidcBase = (baseUrl: string, realm: string) =>
    `${trimTrailingSlash(baseUrl)}/realms/${realm}/protocol/openid-connect`;

// Single place to define the frontend callback route used by Keycloak.
const getRedirectUri = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/login-success`;
};

// Only allow internal redirect paths (starting with "/") to avoid open-redirects.
const sanitizeRedirectPath = (redirectPath?: string | null) => {
    if (!redirectPath) return REDIRECT_PATH_FALLBACK;
    if (!redirectPath.startsWith("/") || redirectPath.startsWith("//")) return REDIRECT_PATH_FALLBACK;
    return redirectPath;
};

/**
 * Entry point to start the Keycloak Authorization Code + PKCE flow.
 * - Builds state + PKCE verifier/challenge.
 * - Stores transaction in sessionStorage.
 * - Redirects browser to Keycloak login / register page.
 */
export const startKeycloakLogin = async (
    params: {
        baseUrl: string;
        realm: string;
        clientId: string;
        redirectPath?: string | null;
        idpHint?: "google" | "facebook";
        action?: "register";
    },
) => {
    const { baseUrl, realm, clientId, redirectPath, idpHint, action } = params;
    ensureConfigured(baseUrl, realm, clientId);

    const state = randomString(32);
    const codeVerifier = randomString(96);
    const codeChallenge = toBase64Url(await sha256(codeVerifier));
    const normalizedRedirectPath = sanitizeRedirectPath(redirectPath);

    saveAuthTransaction({
        state,
        codeVerifier,
        redirectPath: normalizedRedirectPath,
        createdAt: Date.now(),
    });

    const authEndpoint = `${createOidcBase(baseUrl, realm)}/auth`;
    const query = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        scope: "openid profile email",
        redirect_uri: getRedirectUri(),
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
    });

    if (idpHint) {
        query.set("kc_idp_hint", idpHint);
    }

    // Nếu muốn mở thẳng trang đăng ký của Keycloak
    if (action === "register") {
        query.set("kc_action", "register");
    }

    window.location.assign(`${authEndpoint}?${query.toString()}`);
};

/**
 * Handle the `/login-success` callback:
 * - Validates `state` against the saved transaction.
 * - Exchanges the authorization `code` for tokens at /token.
 * - Returns a normalised token bundle + original redirectPath.
 */
export const exchangeCodeForTokens = async (
    params: {
        baseUrl: string;
        realm: string;
        clientId: string;
        code: string;
        state: string;
    },
): Promise<KeycloakExchangeResult> => {
    const { baseUrl, realm, clientId, code, state } = params;
    ensureConfigured(baseUrl, realm, clientId);

    const txn = readAuthTransaction();
    if (!txn) {
        throw new Error("Login session expired. Please try sign in again.");
    }

    if (txn.state !== state) {
        clearAuthTransaction();
        throw new Error("Invalid login state. Please try sign in again.");
    }

    const tokenEndpoint = `${createOidcBase(baseUrl, realm)}/token`;
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code,
        redirect_uri: getRedirectUri(),
        code_verifier: txn.codeVerifier,
    });

    const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    if (!response.ok) {
        clearAuthTransaction();
        throw new Error("Failed to exchange authorization code.");
    }

    const data = (await response.json()) as KeycloakTokenResponse;
    clearAuthTransaction();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? null,
        idToken: data.id_token ?? null,
        redirectPath: txn.redirectPath ?? REDIRECT_PATH_FALLBACK,
    };
};

/**
 * Use a refresh_token to obtain a fresh access token (and optionally a new
 * refresh/id token) directly from Keycloak.
 */
export const refreshKeycloakToken = async (params: {
    baseUrl: string;
    realm: string;
    clientId: string;
    refreshToken: string;
}) => {
    const { baseUrl, realm, clientId, refreshToken } = params;
    ensureConfigured(baseUrl, realm, clientId);

    const tokenEndpoint = `${createOidcBase(baseUrl, realm)}/token`;
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: refreshToken,
    });

    const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    if (!response.ok) {
        throw new Error("Failed to refresh access token.");
    }

    const data = (await response.json()) as KeycloakTokenResponse;
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? refreshToken,
        idToken: data.id_token ?? null,
    };
};

/**
 * Build a full URL to Keycloak's logout endpoint (end-session), including:
 * - client_id
 * - post_logout_redirect_uri back to this frontend
 * - optional id_token_hint to improve UX for some IdPs.
 */
export const buildKeycloakLogoutUrl = (params: {
    baseUrl: string;
    realm: string;
    clientId: string;
    postLogoutRedirectUri?: string;
    idTokenHint?: string | null;
}) => {
    const { baseUrl, realm, clientId, postLogoutRedirectUri, idTokenHint } = params;
    ensureConfigured(baseUrl, realm, clientId);

    const logoutEndpoint = `${createOidcBase(baseUrl, realm)}/logout`;
    const redirectUri =
        postLogoutRedirectUri ||
        (typeof window !== "undefined" ? `${window.location.origin}${REDIRECT_PATH_FALLBACK}` : "");

    const query = new URLSearchParams({
        client_id: clientId,
        post_logout_redirect_uri: redirectUri,
    });

    if (idTokenHint) {
        query.set("id_token_hint", idTokenHint);
    }

    return `${logoutEndpoint}?${query.toString()}`;
};
