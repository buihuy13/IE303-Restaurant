import { Settings as SettingsIcon } from "lucide-react";
import { SettingsSectionCard } from "./SettingsSectionCard";

export function SettingsGeneral() {
    return (
        <SettingsSectionCard
            icon={SettingsIcon}
            iconBgClass="bg-blue-100 dark:bg-blue-900"
            iconColorClass="text-blue-600 dark:text-blue-400"
            title="General Settings"
        >
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    System Name
                </label>
                <input
                    type="text"
                    defaultValue="Restaurant Management System"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Support Email
                </label>
                <input
                    type="email"
                    defaultValue="support@restaurant.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
            </div>
        </SettingsSectionCard>
    );
}
