import type { LucideIcon } from "lucide-react";

interface SettingsSectionCardProps {
    icon: LucideIcon;
    iconBgClass: string;
    iconColorClass: string;
    title: string;
    children: React.ReactNode;
}

export function SettingsSectionCard({
    icon: Icon,
    iconBgClass,
    iconColorClass,
    title,
    children,
}: SettingsSectionCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClass}`}
                >
                    <Icon className={iconColorClass} size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}
