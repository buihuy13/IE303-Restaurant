import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export function MyBlogsHeader() {
    return (
        <div className="mb-8 border-b border-gray-200 pb-6">
            <div className="mb-4">
                <Link
                    href="/blog"
                    className="mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Back to All Blogs</span>
                </Link>
            </div>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Writer desk</p>
                    <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-950">My Articles</h1>
                    <p className="max-w-2xl text-gray-600">
                        Draft, publish, and archive FoodEats stories with the same fields supported by the backend today.
                    </p>
                </div>
                <Link
                    href="/blog/create"
                    className="flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-semibold text-white transition-opacity hover:bg-brand-orange/90"
                >
                    <Plus className="h-5 w-5" />
                    New Article
                </Link>
            </div>
        </div>
    );
}
