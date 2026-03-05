import type { DashboardDateRangePreset } from "@/lib/api/dashboardApi";

interface DashboardHeaderProps {
    rangePreset: DashboardDateRangePreset;
    onRangeChange: (preset: DashboardDateRangePreset) => void;
}

export function DashboardHeader({ rangePreset, onRangeChange }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm font-medium text-gray-600 dark:text-white/60 mt-1">System overview</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <select
                    value={rangePreset}
                    onChange={(e) => onRangeChange(e.target.value as DashboardDateRangePreset)}
                    className="relative z-20 inline-flex appearance-none bg-transparent py-2 pl-3 pr-8 text-sm font-medium outline-none border border-stroke dark:border-strokedark rounded-lg dark:bg-meta-4"
                    aria-label="Date range"
                    title="Date range"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="ytd">Year to date</option>
                    <option value="all">All time</option>
                </select>
            </div>
        </div>
    );
}
