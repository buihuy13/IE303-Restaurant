"use client";

import { useAdminCategoriesPage } from "@/hooks/admin/useAdminCategoriesPage";

import { AdminCategoryRow } from "./AdminCategoryRow";

export default function AdminCategoriesPageShell() {
  const { categories } = useAdminCategoriesPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          Category list (mock)
        </div>
        {categories.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No categories (mock).
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((c) => (
              <AdminCategoryRow key={c} name={c} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
