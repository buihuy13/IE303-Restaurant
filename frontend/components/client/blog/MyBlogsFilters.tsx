import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import type { BlogStatus } from "@/types/blog.type";

interface MyBlogsFiltersProps {
    status: BlogStatus | "";
    onStatusChange: (s: BlogStatus | "") => void;
}

export function MyBlogsFilters({ status, onStatusChange }: MyBlogsFiltersProps) {
    const statusClasses: Record<BlogStatus, string> = {
        DRAFT: "bg-gray-600",
        PUBLISHED: "bg-emerald-500",
        ARCHIVED: "bg-amber-500",
    };

    return (
        <div className="mb-8 border-b border-gray-200 pb-6">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <button
                    type="button"
                    onClick={() => onStatusChange("")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                        status === ""
                            ? "bg-gray-700 text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    All
                </button>
                {Object.entries(BLOG_STATUS_LABELS).map(([value, { label }]) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onStatusChange(value as BlogStatus)}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                            status === value
                                ? `${statusClasses[value as BlogStatus]} text-white`
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
