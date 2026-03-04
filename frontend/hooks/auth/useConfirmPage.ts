"use client";

export function useConfirmPage() {
  return {
    title: "Confirm",
    description:
      "Mock confirmation page (e.g. email confirm). No backend.",
    primaryLink: { href: "/", label: "Home" },
  };
}
