"use client";

import Link from "next/link";

import { useVerifyEmailPage } from "@/hooks/auth/useVerifyEmailPage";

export default function VerifyEmailPageShell() {
  const { title, description, primaryLink } = useVerifyEmailPage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        <Link
          href={primaryLink.href}
          className="mt-4 inline-block rounded-lg bg-[#EE4D2D] px-4 py-2 text-sm font-medium text-white hover:bg-[#EE4D2D]/90"
        >
          {primaryLink.label}
        </Link>
      </div>
    </div>
  );
}
