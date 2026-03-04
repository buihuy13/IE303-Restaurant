import type { MockAdminSetting } from "@/constants";

type AdminSettingRowProps = {
  setting: MockAdminSetting;
};

export function AdminSettingRow({ setting }: AdminSettingRowProps) {
  return (
    <li className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-0">
      <span className="text-sm font-medium text-gray-700">{setting.label}</span>
      <span className="text-sm text-gray-900">{setting.value}</span>
    </li>
  );
}
