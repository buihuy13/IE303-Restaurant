import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { BRAND_ORANGE } from "@/lib/constants/blog";

export function MyBlogsHeader() {
    return (
        <div className="mb-8">
            <div className="mb-4">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to All Blogs</span>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Articles</h1>
                    <p className="text-gray-600">Manage your blog posts</p>
                </div>
                <Link
                    href="/blog/create"
                    className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                    style={{ backgroundColor: BRAND_ORANGE }}
                >
                    <Plus className="w-5 h-5" />
                    New Article
                </Link>
            </div>
        </div>
    );
}
