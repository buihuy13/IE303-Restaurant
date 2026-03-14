"use client";

import { Logo } from "@/constants";
import { getLoginRedirectPath } from "@/lib/utils/redirectUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
    const { isAuthenticated, authRole, loginWithKeycloak } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const hasStartedLoginRef = useRef(false);

    // Nếu đã login rồi mà vẫn vào /login thì redirect về trang phù hợp
    useEffect(() => {
        if (!isAuthenticated) return;
        const redirectPath = getLoginRedirectPath(authRole ?? null, searchParams.get("redirect"));
        router.replace(redirectPath);
    }, [isAuthenticated, authRole, router, searchParams]);

    // Nếu chưa login thì tự động chuyển sang trang Keycloak (không cần bấm nút)
    useEffect(() => {
        if (isAuthenticated || hasStartedLoginRef.current) return;
        hasStartedLoginRef.current = true;

        (async () => {
            try {
                await loginWithKeycloak({
                    redirectPath: searchParams.get("redirect"),
                });
            } catch (error) {
                hasStartedLoginRef.current = false;
                const message = error instanceof Error ? error.message : "Unable to start Keycloak login.";
                toast.error(message);
            }
        })();
    }, [isAuthenticated, loginWithKeycloak, searchParams]);

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Link href="/" className="flex items-center">
                        <Image
                            src={Logo}
                            alt="FoodEats Logo"
                            width={140}
                            height={46}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Redirecting to Sign In...</h2>
                <p className="text-sm text-gray-600 text-center mb-2">
                    Đang chuyển hướng tới trang đăng nhập Keycloak. Vui lòng chờ trong giây lát.
                </p>
                <p className="text-xs text-gray-500 text-center">
                    Nếu không được chuyển hướng tự động, hãy reload lại trang hoặc thử lại sau.
                </p>
            </div>
        </section>
    );
}
