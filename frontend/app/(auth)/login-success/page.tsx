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
    const { completeKeycloakLogin } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const callbackError = searchParams.get("error");

        if (callbackError) {
            setError("Sign in was cancelled or rejected by the identity provider.");
            setLoading(false);
            toast.error("Sign in was cancelled. Please try again.");
            setTimeout(() => {
                router.replace("/login");
            }, 3000);
            return;
        }

        if (!code || !state) {
            setError("Missing authorization code. Please login again.");
            setLoading(false);
            toast.error("Missing authorization code. Please login again.");
            setTimeout(() => {
                router.replace("/login");
            }, 3000);
            return;
        }

        const processKeycloakCallback = async () => {
            try {
                setLoading(true);

                const { success, redirectPath } = await completeKeycloakLogin(code, state);

                if (success) {
                    toast.success("Login successful! Welcome back! 🎉", { duration: 2000 });
                    const currentUser = useAuthStore.getState().user;
                    const finalRedirect = getLoginRedirectPath(currentUser?.role ?? null, redirectPath);
                    router.replace(finalRedirect);
                } else {
                    setError("Failed to complete Keycloak login. Please try again.");
                    toast.error("Failed to complete login. Please try again.", { duration: 3000 });
                    setTimeout(() => {
                        router.replace("/login");
                    }, 3000);
                }
            } catch (err) {
                console.error("Keycloak callback error:", err);
                setError("An error occurred during login. Please try again.");
                toast.error("An error occurred during login. Please try again.", { duration: 3000 });
                setTimeout(() => {
                    router.replace("/login");
                }, 3000);
            } finally {
                setLoading(false);
            }
        };

        processKeycloakCallback();
    }, [completeKeycloakLogin, router, searchParams]);

    return (
        <section className="min-h-screen flex items-center justify-center bg-brand-yellowlight p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center">
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-brand-black mb-2">Completing Login...</h2>
                        <p className="text-gray-600">Please wait while we sign you in.</p>
                    </>
                ) : error ? (
                    <>
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-brand-black mb-2">Login Failed</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-500">Redirecting to login page...</p>
                    </>
                ) : (
                    <>
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-brand-black mb-2">Login Successful!</h2>
                        <p className="text-gray-600">Redirecting to home page...</p>
                    </>
                )}
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
