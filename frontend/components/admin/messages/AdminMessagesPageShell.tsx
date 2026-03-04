"use client";

import { useAdminMessagesPage } from "@/hooks/admin/useAdminMessagesPage";

import { AdminMessageRow } from "./AdminMessageRow";

export default function AdminMessagesPageShell() {
  const { messages, formatDate } = useAdminMessagesPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          Message list (mock)
        </div>
        {messages.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No messages (mock).
          </p>
        ) : (
        <ul className="divide-y divide-gray-200">
          {messages.map((m) => (
            <AdminMessageRow
              key={m.id}
              message={m}
              formatDate={formatDate}
            />
          ))}
        </ul>
        )}
      </div>
    </div>
  );
}
