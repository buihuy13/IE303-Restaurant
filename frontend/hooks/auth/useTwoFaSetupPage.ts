"use client";

import toast from "react-hot-toast";

export function useTwoFaSetupPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("2FA setup (mock).");
  };

  return { handleSubmit };
}
