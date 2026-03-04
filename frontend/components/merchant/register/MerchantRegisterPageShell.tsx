"use client";

import Link from "next/link";

import { useMerchantRegisterPage } from "@/hooks/merchant/useMerchantRegisterPage";

export default function MerchantRegisterPageShell() {
  const { title, description, primaryLink } = useMerchantRegisterPage();

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="flex gap-3">
        <Link
          href={primaryLink.href}
          className="rounded-lg bg-[#EE4D2D] px-4 py-2 text-sm font-medium text-white hover:bg-[#EE4D2D]/90"
        >
          {primaryLink.label}
        </Link>
      </div>
    </div>
  );
}
