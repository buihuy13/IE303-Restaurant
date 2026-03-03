import { useMemo } from "react";
import toast from "react-hot-toast";

import { mockGroupOrder } from "@/constants";

export function useGroupOrderPage() {
  const totalAmount = useMemo(
    () =>
      mockGroupOrder.participants.reduce((sum, participant) => {
        const participantTotal = participant.items.reduce(
          (sub, item) => sub + item.price * item.quantity,
          0,
        );
        return sum + participantTotal;
      }, 0),
    [],
  );

  const handleCopy = () => {
    const url = `${window.location.origin}/group-orders/${mockGroupOrder.shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied (mock).");
  };

  return {
    groupOrder: mockGroupOrder,
    totalAmount,
    handleCopy,
  };
}

