"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";

import {
  mockGroupOrdersByToken,
  type MockGroupOrder,
  type MockGroupOrderStatus,
} from "@/constants";
import { useAuthStore } from "@/stores/use-auth-store";

const STATUS_LABELS: Record<MockGroupOrderStatus, string> = {
  open: "Open",
  locked: "Locked",
  ordered: "Confirmed",
  cancelled: "Canceled",
};

export function useGroupOrderPage(shareToken: string) {
  const { user, isAuthenticated } = useAuthStore();

  const groupOrder: MockGroupOrder | null = useMemo(() => {
    if (!shareToken) return null;
    return mockGroupOrdersByToken[shareToken] ?? null;
  }, [shareToken]);

  const loading = false;

  const shareLink =
    typeof window !== "undefined" && shareToken
      ? `${window.location.origin}/group-orders/${shareToken}`
      : "";

  const isCreator = Boolean(
    groupOrder && user && groupOrder.creatorId === user.id,
  );
  const currentParticipant = groupOrder?.participants.find(
    (p) => p.userId === user?.id,
  );
  const isParticipant = Boolean(currentParticipant);
  const canJoin =
    !isParticipant &&
    groupOrder?.status === "open";
  const canLock =
    isCreator &&
    groupOrder?.status === "open" &&
    (groupOrder.participants.length ?? 0) > 0;
  const canConfirm =
    isCreator &&
    (groupOrder?.status === "open" || groupOrder?.status === "locked");
  const canCancel =
    isCreator &&
    groupOrder?.status !== "ordered" &&
    groupOrder?.status !== "cancelled";

  const formatPrice = (price: number) =>
    price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied.");
  };

  const handleLock = () => {
    toast.success("Group order locked (mock).");
  };

  const handleConfirm = () => {
    toast.success("Group order confirmed (mock).");
  };

  const handleCancel = () => {
    toast.success("Group order canceled (mock).");
  };

  const handleRemoveParticipant = (_userId: string, _userName: string) => {
    toast.success("Participant removed (mock).");
  };

  const statusLabel = groupOrder
    ? STATUS_LABELS[groupOrder.status] ?? groupOrder.status
    : "";

  return {
    groupOrder,
    loading,
    shareLink,
    isCreator,
    isParticipant,
    canJoin,
    canLock,
    canConfirm,
    canCancel,
    isAuthenticated,
    currentUser: user,
    statusLabel,
    formatPrice,
    handleCopyLink,
    handleLock,
    handleConfirm,
    handleCancel,
    handleRemoveParticipant,
  };
}
