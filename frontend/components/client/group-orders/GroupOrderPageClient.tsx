"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGroupOrderData } from "@/hooks/client/group-orders/useGroupOrderData";
import { useGroupOrderActions } from "@/hooks/client/group-orders/useGroupOrderActions";
import { useGroupOrderPermissions } from "@/hooks/client/group-orders/useGroupOrderPermissions";
import { useGroupOrderProductImage } from "@/hooks/client/group-orders/useGroupOrderProductImage";
import { GroupOrderPageView } from "@/components/client/group-orders/GroupOrderPageView";

export default function GroupOrderPageClient() {
    const params = useParams();
    const shareToken = params?.shareToken as string;
    const { user, isAuthenticated } = useAuthStore();
    const { groupOrder, setGroupOrder, loading, fetchGroupOrder } = useGroupOrderData(shareToken);
    const actions = useGroupOrderActions(
        shareToken,
        groupOrder,
        setGroupOrder,
        fetchGroupOrder,
        !!isAuthenticated,
        user?.id,
    );
    const permissions = useGroupOrderPermissions(groupOrder, user?.id);
    const { getItemImageUrl } = useGroupOrderProductImage();

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white py-12">
                <div className="custom-container">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-gray-200 rounded w-1/2" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!groupOrder) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white py-12">
                <div className="custom-container">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
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

    const shareLink =
        typeof window !== "undefined" ? `${window.location.origin}/group-orders/${shareToken}` : "";

    return (
        <GroupOrderPageView
            groupOrder={groupOrder}
            shareToken={shareToken}
            shareLink={shareLink}
            userId={user?.id}
            isAuthenticated={!!isAuthenticated}
            actions={actions}
            permissions={permissions}
            getItemImageUrl={getItemImageUrl}
        />
    );
}

