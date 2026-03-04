"use client";

import { useAdminSizesPage } from "@/hooks/admin/useAdminSizesPage";

import { AdminSizeRow } from "./AdminSizeRow";

export default function AdminSizesPageShell() {
  const { sizes } = useAdminSizesPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sizes</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          Size list (mock)
        </div>
        {sizes.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No sizes (mock).
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {sizes.map((s) => (
              <AdminSizeRow key={s} name={s} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
