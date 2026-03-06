import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { BRAND_ORANGE } from "@/lib/constants/blog";

interface BlogListHeaderProps {
    isAuthenticated: boolean;
}

export function BlogListHeader({ isAuthenticated }: BlogListHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div
                        className="w-1 h-10 rounded-full"
                        style={{ backgroundColor: BRAND_ORANGE }}
                    />
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Food Magazine</h1>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl">
                    Discover great articles about food, recipes and cooking tips
                </p>
            </div>
            {isAuthenticated && (
                <div className="flex gap-3">
                    <Link
                        href="/blog/my-blogs"
                        className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-[#EE4D2D] hover:text-[#EE4D2D] transition-all font-medium shadow-sm"
                    >
                        <FileText className="w-4 h-4" />
                        My Posts
                    </Link>
                    <Link
                        href="/blog/create"
                        className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        style={{ backgroundColor: BRAND_ORANGE }}
                    >
                        <Plus className="w-4 h-4" />
                        Write Post
                    </Link>
                </div>
            )}
        </div>
    );
}
