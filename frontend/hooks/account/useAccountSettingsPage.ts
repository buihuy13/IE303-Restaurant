import { useState } from "react";

type MockSettings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  darkMode: boolean;
};

const initialSettings: MockSettings = {
  emailNotifications: true,
  smsNotifications: false,
  darkMode: false,
};

export function useAccountSettingsPage() {
  const [settings, setSettings] =
    useState<MockSettings>(initialSettings);

  const toggle = (key: keyof MockSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return {
    settings,
    toggle,
  };
}

