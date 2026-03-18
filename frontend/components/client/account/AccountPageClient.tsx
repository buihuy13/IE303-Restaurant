"use client";

import { useState } from "react";
import { Heart, Loader2, PackageCheck, ShoppingBag } from "lucide-react";
import { AccountPageView } from "@/components/client/account/AccountPageView";
import { useAccountProfile } from "@/hooks/client/account/useAccountProfile";
import { useAccountOrdersAndStats } from "@/hooks/client/account/useAccountOrdersAndStats";

const DEFAULT_STATS = [
    { name: "Total Orders", value: "0", icon: ShoppingBag },
    { name: "Last Order Status", value: "N/A", icon: PackageCheck },
    { name: "Favorite Dish", value: "N/A", icon: Heart },
];

export default function AccountPageClient() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, loading, mounted } = useAccountProfile();
    const { stats, recentOrders, ordersLoading } = useAccountOrdersAndStats(user?.id, mounted && !!user?.id && !loading);

    if (!mounted || loading || ordersLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-orange" />
                    <div className="text-sm font-semibold text-gray-800">Loading your account...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm max-w-xl mx-auto">
                    <div className="text-5xl mb-3">👤</div>
                    <p className="text-gray-800 font-semibold">No user data available</p>
                    <p className="text-sm text-gray-600 mt-1">Please refresh the page or sign in again.</p>
                </div>
            </div>
        );
    }

    const avatarInitial = user.username.charAt(0).toUpperCase();
    const avatarUrl = `https://placehold.co/100x100/EFE8D8/333?text=${avatarInitial}`;

    return (
        <AccountPageView
            bannerProps={{
                username: user.username,
                email: user.email ?? "",
                avatarUrl,
                onEditProfile: () => setIsModalOpen(true),
            }}
            stats={stats.length > 0 ? stats : DEFAULT_STATS}
            recentActivityProps={{
                recentOrders,
            }}
            profileModalProps={{
                isOpen: isModalOpen,
                onClose: () => setIsModalOpen(false),
                user: {
                    name: user.username ?? "",
                    avatar: avatarUrl,
                    phone: user.phone ?? "",
                },
            }}
        />
    );
}
