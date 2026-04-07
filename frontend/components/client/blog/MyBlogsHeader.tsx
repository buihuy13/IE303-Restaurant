import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export function MyBlogsHeader() {
    return (
        <div className="mb-8">
            <div className="mb-4">
                <Link
                    href="/blog"
                    className="mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to All Blogs</span>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-4xl font-bold text-gray-900">My Articles</h1>
                    <p className="text-gray-600">Manage your blog posts</p>
                </div>
                <Link
                    href="/blog/create"
                    className="flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 font-semibold text-white transition-opacity hover:bg-brand-orange/90"
                >
                    <Plus className="w-5 h-5" />
                    New Article
                </Link>
            </div>
        </div>
    );
}
