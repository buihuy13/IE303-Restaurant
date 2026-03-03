"use client";

import { useAccountSettingsPage } from "@/hooks/account/useAccountSettingsPage";

import { AccountSidebar } from "./AccountSidebar";

export default function AccountSettingsPageShell() {
  const { settings, toggle } = useAccountSettingsPage();

  return (
    <div className="custom-container py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <AccountSidebar />
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-brand-black md:text-2xl">
            Settings (mock)
          </h1>
          <p className="mt-1 text-xs text-brand-grey">
            These switches are stored only in React state for demo.
          </p>

          <div className="mt-4 space-y-3 text-sm">
            <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3">
              <div>
                <p className="font-semibold text-brand-black">
                  Email notifications
                </p>
                <p className="text-xs text-brand-grey">
                  Receive order updates via email.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => toggle("emailNotifications")}
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3">
              <div>
                <p className="font-semibold text-brand-black">
                  SMS notifications
                </p>
                <p className="text-xs text-brand-grey">
                  Receive order updates via SMS.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={() => toggle("smsNotifications")}
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3">
              <div>
                <p className="font-semibold text-brand-black">Dark mode</p>
                <p className="text-xs text-brand-grey">
                  Toggle dark mode (mock only).
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={() => toggle("darkMode")}
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

