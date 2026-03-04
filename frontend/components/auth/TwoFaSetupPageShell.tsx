"use client";

import Link from "next/link";

import { useTwoFaSetupPage } from "@/hooks/auth/useTwoFaSetupPage";

export default function TwoFaSetupPageShell() {
  const { handleSubmit } = useTwoFaSetupPage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">2FA setup</h1>
        <p className="mt-1 text-sm text-gray-500">Mock – no real 2FA.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Code
            </label>
            <input
              type="text"
              placeholder="000000"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#EE4D2D] py-2 text-sm font-medium text-white hover:bg-[#EE4D2D]/90"
          >
            Confirm (mock)
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/" className="text-[#EE4D2D] hover:underline">
            Skip / Home
          </Link>
        </p>
      </div>
    </div>
  );
}
