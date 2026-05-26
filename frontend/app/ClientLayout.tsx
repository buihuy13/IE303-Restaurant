"use client";

import AuthProvider from "@/components/auth/AuthProvider";
import CravingSuggestionCard from "@/components/client/HomePage/CravingSuggestionCard";
import Header from "@/components/header/Header";
import Footer from "@/components/layout/client/Footer";
import ChatProvider from "@/components/providers/ChatProvider";
import { ClientThemeProvider } from "@/components/providers/ClientThemeProvider";
import SSEProvider from "@/components/providers/SSEProvider";
import ConfirmProvider from "@/components/ui/ConfirmModal";
import { useAddressSync } from "@/lib/hooks/useAddressSync";
import { useCartSync } from "@/lib/hooks/useCartSync";
import { usePathname } from "next/navigation";
import React from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isMerchant = pathname.includes("merchant");
    const isAdmin = pathname.startsWith("/admin");
    const isManager = pathname.startsWith("/manager");
    // Auth pages should not show the main header/footer
    const authPaths = ["/login", "/register", "/login-success"];
    const isAuthPage = authPaths.includes(pathname);

    useCartSync();
    useAddressSync();

    // REMOVED: Allow Merchant/Admin to access client pages (home, search, restaurants, etc.)
    // They can freely switch between buying view and dashboard view
    // Only redirect if they try to access unauthorized routes (e.g., Merchant accessing /admin)

    // Show Header/Footer only for client pages (not admin/manager/merchant)
    const showHeaderFooter = !isMerchant && !isAdmin && !isManager && !isAuthPage;

    // Theme is applied to <body> by ClientThemeProvider (light default, dark=aurora)
    const mainClassName = showHeaderFooter ? "min-h-screen" : "";
    const clientScopeClass = showHeaderFooter ? "client-theme-scope" : "";

    return (
        <AuthProvider>
            <ConfirmProvider>
                <SSEProvider>
                    <ChatProvider>
                        <ClientThemeProvider>
                            <div className={clientScopeClass}>
                                {showHeaderFooter && <Header />}
                                <main className={mainClassName}>{children}</main>
                                {showHeaderFooter && <Footer />}
                                {showHeaderFooter && <CravingSuggestionCard />}
                            </div>
                        </ClientThemeProvider>
                    </ChatProvider>
                </SSEProvider>
            </ConfirmProvider>
        </AuthProvider>
    );
}
