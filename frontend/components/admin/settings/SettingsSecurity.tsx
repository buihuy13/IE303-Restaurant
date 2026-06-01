import { Lock } from "lucide-react";
import { SettingsSectionCard } from "./SettingsSectionCard";

export function SettingsSecurity() {
    return (
        <SettingsSectionCard
            icon={Lock}
            iconBgClass="bg-red-100 dark:bg-red-900"
            iconColorClass="text-red-600 dark:text-red-400"
            title="Security"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Two-Factor Authentication
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enable two-factor authentication for admin account
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-orange/20 dark:peer-focus:ring-brand-orange/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-orange" />
                </label>
            </div>
            <div>
                <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Change Password
                </button>
            </div>
        </SettingsSectionCard>
    );
}
