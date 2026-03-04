"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useGroupOrderPage } from "@/hooks/group-orders/useGroupOrderPage";

import { GroupOrderDeliveryAddress } from "./GroupOrderDeliveryAddress";
import { GroupOrderHeader } from "./GroupOrderHeader";
import { GroupOrderParticipants } from "./GroupOrderParticipants";
import { GroupOrderSummary } from "./GroupOrderSummary";

export default function GroupOrderPageShell() {
  const params = useParams();
  const shareToken = (params?.shareToken as string) ?? "";

  const {
    groupOrder,
    loading,
    shareLink,
    canJoin,
    canLock,
    canConfirm,
    canCancel,
    isAuthenticated,
    currentUser,
    statusLabel,
    formatPrice,
    handleCopyLink,
    handleLock,
    handleConfirm,
    handleCancel,
    handleRemoveParticipant,
  } = useGroupOrderPage(shareToken);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="custom-container">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md">
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-1/2 rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!groupOrder) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="custom-container">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-md">
              <p className="text-gray-600">Group order not found.</p>
              <Link
                href="/"
                className="mt-4 inline-block text-[#EE4D2D] hover:underline"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="custom-container">
        <div className="mx-auto max-w-4xl space-y-6">
          <GroupOrderHeader
            groupOrder={groupOrder}
            shareToken={shareToken}
            shareLink={shareLink}
            statusLabel={statusLabel}
            canJoin={canJoin}
            canLock={canLock}
            canConfirm={canConfirm}
            canCancel={canCancel}
            isAuthenticated={isAuthenticated}
            onCopyLink={handleCopyLink}
            onLock={handleLock}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />

          <GroupOrderParticipants
            groupOrder={groupOrder}
            shareToken={shareToken}
            currentUserId={currentUser?.id}
            formatPrice={formatPrice}
            onRemoveParticipant={handleRemoveParticipant}
          />

          <GroupOrderSummary
            groupOrder={groupOrder}
            formatPrice={formatPrice}
          />

          <GroupOrderDeliveryAddress address={groupOrder.deliveryAddress} />
        </div>
      </div>
    </main>
  );
}
