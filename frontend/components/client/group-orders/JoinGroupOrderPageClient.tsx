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
            <main className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white py-12">
                <div className="custom-container">
                    <div className="max-w-6xl mx-auto">
                        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-gray-200 rounded w-1/2" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!state.groupOrder) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white py-12">
                <div className="custom-container">
                    <div className="max-w-6xl mx-auto text-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                        <div className="text-5xl mb-3">🧾</div>
                        <p className="text-gray-900 font-semibold">Group order not found</p>
                        <p className="text-sm text-gray-600 mt-1">The link may be invalid or the order has ended.</p>
                        <Link
                            href="/"
                            className="inline-flex mt-5 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-brand-orange ring-1 ring-brand-orange/30 hover:bg-brand-orange/10 transition-colors"
                        >
                            Back to home
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return <JoinGroupOrderPageView shareToken={shareToken} state={state} />;
}

