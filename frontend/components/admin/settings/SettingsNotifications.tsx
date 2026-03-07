import { Bell } from "lucide-react";
import { SettingsSectionCard } from "./SettingsSectionCard";

export function SettingsNotifications() {
    return (
        <SettingsSectionCard
            icon={Bell}
            iconBgClass="bg-yellow-100 dark:bg-yellow-900"
            iconColorClass="text-yellow-600 dark:text-yellow-400"
            title="Notifications"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive emails for important events
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-orange/20 dark:peer-focus:ring-brand-orange/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-orange" />
                </label>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Direct notifications in the browser
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-orange/20 dark:peer-focus:ring-brand-orange/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-orange" />
                </label>
            </div>
        </SettingsSectionCard>
    );
}
