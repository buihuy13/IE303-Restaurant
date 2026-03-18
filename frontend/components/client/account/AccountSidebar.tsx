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
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold tracking-tight mb-4 text-gray-900">Account Menu</h3>
                        <nav className="space-y-2">
                                {navLinks.map((link) => {
                                        const isActive = pathname === link.href;
                                        return (
                                                <Link
                                                        key={link.name}
                                                        href={link.href}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-colors ${
                                                                isActive
                                                                        ? "bg-brand-orange text-white"
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
                                        className="flex w-full items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                        <LogOut className="w-5 h-5" />
                                        <span>Log Out</span>
                                </button>
                        </nav>
                </div>
        );
}
