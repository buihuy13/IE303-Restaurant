import { useState } from "react";
import toast from "react-hot-toast";

import { mockAdminMerchantRequests } from "@/constants";

export function useAdminMerchantRequestsPage() {
  const [requests, setRequests] = useState(mockAdminMerchantRequests);

  const handleApprove = (id: string) => {
    toast.success("Request approved (mock).");
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return { requests, handleApprove };
}
