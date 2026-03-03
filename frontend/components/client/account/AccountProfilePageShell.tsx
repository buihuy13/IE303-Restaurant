"use client";

import { useAccountProfilePage } from "@/hooks/account/useAccountProfilePage";

import { AccountSidebar } from "./AccountSidebar";

export default function AccountProfilePageShell() {
  const { user, handleMockLogout } = useAccountProfilePage();

  return (
    <div className="custom-container py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <AccountSidebar />
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-brand-black md:text-2xl">
            Profile (mock)
          </h1>
          {user ? (
            <div className="mt-4 space-y-2 text-sm text-brand-grey">
              <p>
                <span className="font-semibold text-brand-black">Name: </span>
                {user.fullName}
              </p>
              <p>
                <span className="font-semibold text-brand-black">Email: </span>
                {user.email}
              </p>
              <button
                type="button"
                onClick={handleMockLogout}
                className="mt-4 rounded-full bg-brand-black px-4 py-2 text-xs font-semibold text-brand-white"
              >
                Mock logout
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-brand-grey">
              No mock user in store. This page reads from `mockUsers` via the
              auth store.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

