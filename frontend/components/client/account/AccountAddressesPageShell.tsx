"use client";

import { useAccountAddressesPage } from "@/hooks/account/useAccountAddressesPage";

import { AccountSidebar } from "./AccountSidebar";

export default function AccountAddressesPageShell() {
  const { addresses, removeAddress } = useAccountAddressesPage();

  return (
    <div className="custom-container py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <AccountSidebar />
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-brand-black md:text-2xl">
            Addresses (mock)
          </h1>

          {addresses.length === 0 ? (
            <p className="mt-4 text-sm text-brand-grey">
              No mock addresses saved.
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {addresses.map((addr) => (
                <li
                  key={addr.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-black">
                      {addr.label}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-grey">
                      {addr.detail}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddress(addr.id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

