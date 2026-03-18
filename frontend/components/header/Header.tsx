"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/Button";
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
                                        ? "bg-white/80 backdrop-blur-xl border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                                        : "bg-white border-gray-100"
                        }`}
                >
                        <div className="custom-container">
                                <div className="flex items-center justify-between h-16 lg:h-[72px] px-4 lg:px-6 gap-3 lg:gap-6">
                                        {/* Left: Logo */}
                                        <div className="flex-shrink-0">
                                                <LogoComponent />
                                        </div>

                                        {/* Center: Address Selector + Search Bar */}
                                        <div className="hidden lg:flex flex-1 items-center gap-3 mx-6 lg:mx-8">
                                                <AddressSelector />
                                                <div className="flex-1 max-w-2xl">
                                                        <Suspense
                                                                fallback={
                                                                        <div className="h-11 w-full rounded-full bg-gray-50 border border-gray-200 animate-pulse" />
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
                                                                className="rounded-full whitespace-nowrap shadow-sm hover:shadow-md"
                                                        >
                                                                <Link href={dashboardPath}>{dashboardLabel}</Link>
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
