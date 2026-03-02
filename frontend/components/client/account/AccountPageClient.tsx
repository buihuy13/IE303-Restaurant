"use client";

import { useState } from "react";
import { Heart, Loader2, PackageCheck, ShoppingBag } from "lucide-react";
import { AccountPageView } from "@/components/client/Account/AccountPageView";
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
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-[#EE4D2D]" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No user data available</p>
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
