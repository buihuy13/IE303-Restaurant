import { mockAdminSettings } from "@/constants";

export function useAdminSettingsPage() {
  const settings = mockAdminSettings;
  return { settings };
}
