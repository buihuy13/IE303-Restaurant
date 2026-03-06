"use client";

import { SettingsHeader } from "@/components/admin/settings/SettingsHeader";
import { SettingsGeneral } from "@/components/admin/settings/SettingsGeneral";
import { SettingsNotifications } from "@/components/admin/settings/SettingsNotifications";
import { SettingsSecurity } from "@/components/admin/settings/SettingsSecurity";
import { SettingsAppearance } from "@/components/admin/settings/SettingsAppearance";
import { SettingsLanguage } from "@/components/admin/settings/SettingsLanguage";

export default function SettingsPageClient() {
    return (
        <div className="space-y-6">
            <SettingsHeader />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SettingsGeneral />
                <SettingsNotifications />
                <SettingsSecurity />
                <SettingsAppearance />
                <SettingsLanguage />
            </div>
            <div className="flex justify-end">
                <button
                    type="button"
                    className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
