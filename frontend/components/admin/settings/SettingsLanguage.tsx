import { Globe } from "lucide-react";
import { SettingsSectionCard } from "./SettingsSectionCard";

export function SettingsLanguage() {
    return (
        <SettingsSectionCard
            icon={Globe}
            iconBgClass="bg-green-100 dark:bg-green-900"
            iconColorClass="text-green-600 dark:text-green-400"
            title="Language & Region"
        >
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                </label>
                <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    aria-label="Language"
                    title="Language"
                >
                    <option value="vi">Vietnamese</option>
                    <option value="en">English</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Zone
                </label>
                <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    aria-label="Time zone"
                    title="Time zone"
                >
                    <option value="Asia/Ho_Chi_Minh">GMT+7 (Ho Chi Minh)</option>
                    <option value="UTC">UTC</option>
                </select>
            </div>
        </SettingsSectionCard>
    );
}
