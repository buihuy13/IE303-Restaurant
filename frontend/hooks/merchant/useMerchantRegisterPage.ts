"use client";

export function useMerchantRegisterPage() {
  return {
    title: "Merchant registration",
    description:
      "This is a mock registration page. In production you would submit a form to request merchant approval.",
    primaryLink: { href: "/merchant", label: "Back to dashboard" },
  };
}
