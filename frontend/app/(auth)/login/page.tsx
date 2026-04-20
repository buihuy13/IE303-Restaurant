"use client";

import { Logo } from "@/constants";
import { getLoginRedirectPath } from "@/lib/utils/redirectUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
    const { isAuthenticated, authRole, loginWithKeycloak } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [redirectError, setRedirectError] = useState<string | null>(null);

    const hasStartedLoginRef = useRef(false);

    // Nếu đã login rồi mà vẫn vào /login thì redirect về trang phù hợp
    useEffect(() => {
        if (!isAuthenticated) return;
        const redirectPath = getLoginRedirectPath(authRole ?? null, searchParams.get("redirect"));
        router.replace(redirectPath);
    }, [isAuthenticated, authRole, router, searchParams]);

    // Nếu chưa login thì tự động chuyển sang trang Keycloak (không cần bấm nút)
    useLayoutEffect(() => {
        if (isAuthenticated || hasStartedLoginRef.current) return;
        hasStartedLoginRef.current = true;
        setRedirectError(null);

        (async () => {
            try {
                await loginWithKeycloak({
                    redirectPath: searchParams.get("redirect"),
                });
            } catch (error) {
                hasStartedLoginRef.current = false;
                const message = error instanceof Error ? error.message : "Unable to start Keycloak login.";
                setRedirectError(message);
                toast.error(message);
            }
        })();
    }, [isAuthenticated, loginWithKeycloak, searchParams]);

    if (!isAuthenticated && !redirectError) {
        return null;
    }

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

                <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Không thể mở trang đăng nhập</h2>
                <p className="text-sm text-gray-600 text-center mb-2">
                    {redirectError ?? "Đã xảy ra lỗi khi chuyển hướng tới Keycloak."}
                </p>
                <p className="text-xs text-gray-500 text-center">
                    Vui lòng thử reload lại trang hoặc thử lại sau.
                </p>
            </div>
        </section>
    );
}
