"use client";

import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import AddressSelector from "./AddressSelector";
import LogoComponent from "./Logo";
import MobileMenu from "./MobileMenu";
import NavActions from "./NavActions";
import NavigationLinks from "./NavigationLinks";
import SearchBar from "./SearchBar";

export default function Header() {
        const [isScrolled, setIsScrolled] = useState(false);
        const pathname = usePathname();
        const { user, isAuthenticated } = useAuthStore();
        const { theme } = useClientTheme();

        // Check if we're in client view (not in dashboard/admin/merchant pages)
        const isClientView = !pathname.startsWith("/admin") && !pathname.startsWith("/merchant") && !pathname.startsWith("/manager");
        
        // Show dashboard button if user is Merchant/Admin and in client view
        const showDashboardButton = isClientView && isAuthenticated && user && (user.role === "MERCHANT" || user.role === "ADMIN");
        const dashboardPath = user?.role === "MERCHANT" ? "/merchant" : "/admin/dashboard";
        const dashboardLabel = user?.role === "MERCHANT" ? "Merchant Dashboard" : "Admin Dashboard";

        useEffect(() => {
                const handleScroll = () => {
                        setIsScrolled(window.scrollY > 10);
                };

                window.addEventListener("scroll", handleScroll);
                return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        return (
                <header
                        className={`sticky top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
                                isScrolled
                                        ? theme === "dark"
                                                ? "bg-black/25 backdrop-blur-2xl border-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)]"
                                                : "bg-white/85 backdrop-blur-xl border-gray-200/90 shadow-[0_10px_35px_rgba(15,23,42,0.08)]"
                                        : theme === "dark"
                                                ? "bg-black/15 backdrop-blur-xl border-white/10"
                                                : "bg-white/95 border-gray-100"
                        }`}
                >
                        <div className="custom-container">
                                <div className="flex items-center justify-between h-16 lg:h-[74px] gap-3 lg:gap-6">
                                        {/* Left: Logo */}
                                        <div className="flex-shrink-0">
                                                <LogoComponent />
                                        </div>

                                        {/* Center: Address Selector + Search Bar */}
                                        <div className="hidden lg:flex flex-1 items-center gap-3 mx-4 xl:mx-8">
                                                <AddressSelector />
                                                <div className="flex-1 max-w-3xl">
                                                        <Suspense
                                                                fallback={
                                                                        <div
                                                                                className={`h-11 w-full rounded-full border animate-pulse ${
                                                                                        theme === "dark"
                                                                                                ? "bg-white/10 border-white/10"
                                                                                                : "bg-gray-50 border-gray-200/80"
                                                                                }`}
                                                                        />
                                                                }
                                                        >
                                                                <SearchBar />
                                                        </Suspense>
                                                </div>
                                        </div>

                                        {/* Right: Navigation Links + Cart + User */}
                                        <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
                                                <NavigationLinks />
                                             
                                                {/* Dashboard Button - Show if Merchant/Admin in client view */}
                                                {showDashboardButton && (
                                                        <Button
                                                                asChild
                                                                variant="brandOutline"
                                                                size="sm"
                                                                className={`rounded-full whitespace-nowrap shadow-sm hover:shadow-md ${
                                                                        theme === "dark"
                                                                                ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
                                                                                : "border-brand-orange/70 bg-white/80"
                                                                }`}
                                                        >
                                                                <Link href={dashboardPath}>
                                                                    <span className="hidden xl:inline">{dashboardLabel}</span>
                                                                    <span className="xl:hidden">Dashboard</span>
                                                                </Link>
                                                        </Button>
                                                )}
                                                {/* Desktop: Show NavActions (icons + user dropdown) */}
                                                <div className="hidden lg:flex items-center gap-3 lg:gap-4">
                                                        <NavActions />
                                                </div>
                                                {/* Mobile: Show MobileMenu (icons + hamburger menu) */}
                                                <MobileMenu />
                                        </div>
                                </div>
                        </div>
                </header>
        );
}
