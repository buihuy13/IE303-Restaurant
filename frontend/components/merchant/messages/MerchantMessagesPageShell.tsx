"use client";

import { useMerchantMessagesPage } from "@/hooks/merchant/useMerchantMessagesPage";

export default function MerchantMessagesPageShell() {
  const { title, emptyMessage, emptyHint } = useMerchantMessagesPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
          Message list (mock)
        </div>
        <p className="mt-6 text-gray-600">{emptyMessage}</p>
        <p className="mt-2 text-sm text-gray-500">{emptyHint}</p>
      </div>
    </div>
  );
}
