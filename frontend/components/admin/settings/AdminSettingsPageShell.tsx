"use client";

import { useAdminSettingsPage } from "@/hooks/admin/useAdminSettingsPage";

import { AdminSettingRow } from "./AdminSettingRow";

export default function AdminSettingsPageShell() {
  const { settings } = useAdminSettingsPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          Admin settings (mock)
        </div>
        {settings.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No settings (mock).
          </p>
        ) : (
        <ul className="divide-y divide-gray-200">
          {settings.map((s) => (
            <AdminSettingRow key={s.key} setting={s} />
          ))}
        </ul>
        )}
        <p className="border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          In production: site name, logo, payment config, etc.
        </p>
      </div>
    </div>
  );
}
