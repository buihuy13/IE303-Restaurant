import { Plus } from "lucide-react";

interface PromotionsHeaderProps {
    onCreateClick: () => void;
}

export function PromotionsHeader({ onCreateClick }: PromotionsHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Promotions</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Create and manage promotion campaigns
                </p>
            </div>
            <button
                type="button"
                onClick={onCreateClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
                <Plus className="h-5 w-5" />
                Create Promotion
            </button>
        </div>
    );
}
