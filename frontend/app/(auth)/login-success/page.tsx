"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { getLoginRedirectPath } from "@/lib/utils/redirectUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

function LoginSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { completeKeycloakLogin, loginWithKeycloak } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasProcessed = useRef(false);
    const hasRetriedAuth = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;
        const redirectParam = searchParams.get("redirect");
        const redirectPath = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";

        const restartAuthFlow = (reasonToast: string) => {
            if (hasRetriedAuth.current) {
                setLoading(false);
                setError("Failed to complete login. Please try again.");
                toast.error("Unable to complete sign in. Please try again.");
                setTimeout(() => {
                    router.replace("/login");
                }, 1500);
                return;
            }

            hasRetriedAuth.current = true;
            toast(reasonToast, { icon: "ℹ️" });
            void loginWithKeycloak({ redirectPath }).catch((err) => {
                const message = err instanceof Error ? err.message : "Unable to restart sign in.";
                setError(message);
                setLoading(false);
                toast.error(message);
            });
        };

        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const callbackError = searchParams.get("error");
        const callbackErrorDescription = searchParams.get("error_description");

        if (callbackError) {
            const normalizedError = callbackError.toLowerCase();
            const isLikelyRecoverable =
                normalizedError.includes("expired") ||
                normalizedError.includes("session") ||
                normalizedError.includes("temporarily_unavailable") ||
                normalizedError.includes("login_required");
            if (isLikelyRecoverable) {
                restartAuthFlow("Your sign-in session expired after verification. Reconnecting...");
                return;
            }

            setError(callbackErrorDescription || "Sign in was cancelled or rejected by the identity provider.");
            setLoading(false);
            toast.error("Sign in was cancelled. Please try again.");
            return;
        }

        if (!code || !state) {
            restartAuthFlow("Completing email verification. Redirecting to sign in...");
            return;
        }

        const processKeycloakCallback = async () => {
            try {
                setLoading(true);

                const { success, redirectPath } = await completeKeycloakLogin(code, state);

                if (success) {
                    toast.success("Login successful! Welcome back! 🎉", { duration: 2000 });
                    const { authRole } = useAuthStore.getState();
                    const finalRedirect = getLoginRedirectPath(authRole ?? null, redirectPath);
                    router.replace(finalRedirect);
                } else {
                    restartAuthFlow("Finishing verification... redirecting to sign in again.");
                }
            } catch (err) {
                console.error("Keycloak callback error:", err);
                restartAuthFlow("Authentication callback expired. Reconnecting...");
            } finally {
                setLoading(false);
            }
        };

        processKeycloakCallback();
    }, [completeKeycloakLogin, loginWithKeycloak, router, searchParams]);

    // Keep callback page visually silent for successful/ongoing flows
    // so users almost never notice this intermediate route.
    if (loading || !error) {
        return null;
    }

    return (
        <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-brand-black mb-2">Login Failed</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <p className="text-sm text-gray-500">Redirecting to login page...</p>
            </div>
        </section>
    );
}

export default function LoginSuccessPage() {
    return (
        <Suspense fallback={<GlobalLoader label="Loading" sublabel="Signing you in" />}>
            <LoginSuccessContent />
        </Suspense>
    );
}
