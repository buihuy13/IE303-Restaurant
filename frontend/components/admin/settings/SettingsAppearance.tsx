import { Palette } from "lucide-react";
import { SettingsSectionCard } from "./SettingsSectionCard";

export function SettingsAppearance() {
    return (
        <SettingsSectionCard
            icon={Palette}
            iconBgClass="bg-purple-100 dark:bg-purple-900"
            iconColorClass="text-purple-600 dark:text-purple-400"
            title="Appearance"
        >
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme Mode
                </label>
                <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    aria-label="Theme mode"
                    title="Theme mode"
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                </select>
            </div>
        </SettingsSectionCard>
    );
}
