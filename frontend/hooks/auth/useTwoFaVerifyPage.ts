"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useTwoFaVerifyPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("2FA verified (mock).");
    router.push("/");
  };

  return { handleSubmit };
}
