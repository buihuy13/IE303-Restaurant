import { TrendingDown, TrendingUp } from "lucide-react";

export interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: number;
    trendLabel?: string;
    bgColor: string;
    iconColor: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendLabel, bgColor, iconColor }: StatsCardProps) {
    const isPositive = trend !== undefined && trend > 0;
    const isNegative = trend !== undefined && trend < 0;

    return (
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${bgColor}`}>
                            <Icon className={iconColor} size={20} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-black dark:text-white mb-1">{title}</p>
                    <h4 className="text-2xl font-bold text-black dark:text-white mb-2">{value}</h4>
                    {trend !== undefined && (
                        <div className="flex items-center gap-1.5">
                            {isPositive && <TrendingUp size={16} className="text-meta-3" />}
                            {isNegative && <TrendingDown size={16} className="text-meta-1" />}
                            <span
                                className={`text-sm font-medium ${
                                    isPositive ? "text-meta-3" : isNegative ? "text-meta-1" : "text-meta-6"
                                }`}
                            >
                                {Math.abs(trend)}%
                            </span>
                            {trendLabel && (
                                <span className="text-sm font-medium text-black dark:text-white">{trendLabel}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
