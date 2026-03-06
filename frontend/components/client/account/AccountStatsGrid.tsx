import type { AccountStat } from "@/hooks/client/account/useAccountOrdersAndStats";

interface AccountStatsGridProps {
    stats: AccountStat[];
}

export function AccountStatsGrid({ stats }: AccountStatsGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat) => (
                <div
                    key={stat.name}
                    className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 flex items-center gap-4 border-l-4 border-[#EE4D2D]"
                >
                    <div className="bg-orange-100 p-4 rounded-xl">
                        <stat.icon className="w-6 h-6 text-[#EE4D2D]" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
                        <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
