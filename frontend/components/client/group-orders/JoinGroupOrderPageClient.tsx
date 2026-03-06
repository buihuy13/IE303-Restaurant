"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useJoinGroupOrderPage } from "@/hooks/client/group-orders/useJoinGroupOrderPage";
import { JoinGroupOrderPageView } from "@/components/client/group-orders/JoinGroupOrderPageView";

export default function JoinGroupOrderPageClient() {
    const params = useParams();
    const shareToken = params?.shareToken as string;
    const { user, isAuthenticated } = useAuthStore();
    const state = useJoinGroupOrderPage(shareToken, !!isAuthenticated, user?.id);

    if (!isAuthenticated || !user) return null;

    if (state.loading) {
        return (
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                </div>
            </main>
        );
    }

    if (!state.groupOrder) {
        return (
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container text-center">
                    <p className="text-gray-600">Group order not found.</p>
                    <Link href="/" className="text-[#EE4D2D] hover:underline mt-4 inline-block">
                        Back to home
                    </Link>
                </div>
            </main>
        );
    }

    return <JoinGroupOrderPageView shareToken={shareToken} state={state} />;
}

