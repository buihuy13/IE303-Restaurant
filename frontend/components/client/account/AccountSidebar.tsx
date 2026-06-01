"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut, MapPin, Settings, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const navLinks = [
        { name: "My Profile", href: "/account", icon: User },
        { name: "Order History", href: "/account/orders", icon: ShoppingBag },
        { name: "Addresses", href: "/account/addresses", icon: MapPin },
        { name: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountSidebar() {
        const pathname = usePathname();
        const { logout } = useAuthStore();
        const [isLoggingOut, setIsLoggingOut] = useState(false);

        const handleLogout = async () => {
                // Prevent multiple clicks
                if (isLoggingOut) return;

                setIsLoggingOut(true);

                // Show loading toast
                const loadingToast = toast.loading("Logging out...");

                try {
                        // Clear auth state
                        logout({ redirectToKeycloak: true, postLogoutRedirectPath: "/login" });

                        // Dismiss loading and show success
                        toast.dismiss(loadingToast);
                        toast.success("Signing out...", { duration: 1500 });
                } catch (error) {
                        // Handle any logout errors
                        toast.dismiss(loadingToast);
                        toast.error("Failed to logout. Please try again.", { duration: 3000 });
                        console.error("Logout error:", error);
                } finally {
                        // Reset logging out state after navigation
                        setTimeout(() => setIsLoggingOut(false), 500);
                }
        };

        return (
                <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                        <h3 className="mb-4 text-lg font-semibold tracking-tight text-gray-900">Account Menu</h3>
                        <nav className="space-y-2">
                                {navLinks.map((link) => {
                                        const isActive = pathname === link.href;
                                        return (
                                                <Link
                                                        key={link.name}
                                                        href={link.href}
                                                        className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-all ${
                                                                isActive
                                                                        ? "bg-brand-orange text-white shadow-sm"
                                                                        : "text-gray-700 hover:bg-gray-50 hover:text-brand-orange"
                                                        }`}
                                                >
                                                        <link.icon className="w-5 h-5" />
                                                        <span>{link.name}</span>
                                                </Link>
                                        );
                                })}
                                <hr className="my-4" />
                                <button
                                        onClick={handleLogout}
                                        className="flex w-full cursor-pointer items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                                >
                                        <LogOut className="w-5 h-5" />
                                        <span>Log Out</span>
                                </button>
                        </nav>
                </div>
        );
}
