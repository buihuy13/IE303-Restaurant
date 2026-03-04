"use client";

import { useAdminUsersPage } from "@/hooks/admin/useAdminUsersPage";

import { AdminUserRow } from "./AdminUserRow";

export default function AdminUsersPageShell() {
  const { users } = useAdminUsersPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          User list (mock)
        </div>
        {users.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No users (mock).
          </p>
        ) : (
        <ul className="divide-y divide-gray-200">
          {users.map((u) => (
            <AdminUserRow
              key={u.id}
              fullName={u.fullName}
              email={u.email}
              role={u.role}
            />
          ))}
        </ul>
        )}
      </div>
    </div>
  );
}
