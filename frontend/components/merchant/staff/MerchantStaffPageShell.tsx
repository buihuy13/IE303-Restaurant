"use client";

import { useMerchantStaffPage } from "@/hooks/merchant/useMerchantStaffPage";

import { StaffItemRow } from "./StaffItemRow";

export default function MerchantStaffPageShell() {
  const { staff } = useMerchantStaffPage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-gray-900">Team (mock)</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {staff.map((s) => (
            <StaffItemRow
              key={s.id}
              name={s.name}
              email={s.email}
              role={s.role}
            />
          ))}
        </ul>
        <p className="px-4 py-2 text-xs text-gray-500">Mock data.</p>
      </div>
    </div>
  );
}
