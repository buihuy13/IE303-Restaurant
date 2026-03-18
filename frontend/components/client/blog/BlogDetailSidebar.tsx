"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
import RelatedBlogs from "@/components/client/blog/RelatedBlogs";
import type { BlogCategory } from "@/types/blog.type";

interface BlogDetailSidebarProps {
    blogId: string;
    category: BlogCategory;
    popularTags: string[];
}

export function BlogDetailSidebar({ blogId, category, popularTags }: BlogDetailSidebarProps) {
    return (
        <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
                <RelatedBlogs currentBlogId={blogId} category={category} />
                {popularTags.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Tag className="w-5 h-5 text-brand-orange" />
                            <h3 className="text-xl font-bold text-gray-900">Trending Tags</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map((tag, index) => (
                                <Link
                                    key={`${tag}-${index}`}
                                    href={`/blog?search=${encodeURIComponent(tag)}`}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-brand-orange hover:text-white transition-all font-medium"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
