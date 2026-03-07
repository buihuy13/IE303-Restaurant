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
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-lg p-8">
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
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                        <p className="text-gray-600">Group order not found.</p>
                        <Link href="/" className="text-[#EE4D2D] hover:underline mt-4 inline-block">
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

