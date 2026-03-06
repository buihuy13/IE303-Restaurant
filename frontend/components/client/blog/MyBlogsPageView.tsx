"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { Blog, BlogCategory, BlogStatus } from "@/types/blog.type";
import Pagination from "@/components/client/Pagination";
import { MyBlogsHeader } from "@/components/client/blog/MyBlogsHeader";
import { MyBlogsFilters } from "@/components/client/blog/MyBlogsFilters";
import { MyBlogsCard } from "@/components/client/blog/MyBlogsCard";
import { BRAND_ORANGE } from "@/lib/constants/blog";

export interface MyBlogsPageViewProps {
    loading: boolean;
    blogs: Blog[];
    totalPages: number;
    page: number;
    searchInput: string;
    category: BlogCategory | "";
    status: BlogStatus | "";
    deletingId: string | null;
    onSearchInputChange: (value: string) => void;
    onSearch: () => void;
    onCategoryChange: (category: BlogCategory | "") => void;
    onStatusChange: (status: BlogStatus | "") => void;
    onPageChange: (page: number) => void;
    onDelete: (blogId: string, title: string) => Promise<void>;
}

export function MyBlogsPageView({
    loading,
    blogs,
    totalPages,
    page,
    searchInput,
    category,
    status,
    deletingId,
    onSearchInputChange,
    onSearch,
    onCategoryChange,
    onStatusChange,
    onPageChange,
    onDelete,
}: MyBlogsPageViewProps) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="custom-container">
                <MyBlogsHeader />
                <MyBlogsFilters
                    searchInput={searchInput}
                    onSearchInputChange={onSearchInputChange}
                    onSearch={onSearch}
                    category={category}
                    onCategoryChange={onCategoryChange}
                    status={status}
                    onStatusChange={onStatusChange}
                />

                {loading ? (
                    <div className="text-center py-12">
                        <div
                            className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
                            style={{ borderBottomColor: BRAND_ORANGE }}
                        />
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-md">
                        <p className="text-gray-600 mb-4">No articles found</p>
                        <Link
                            href="/blog/create"
                            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                            style={{ backgroundColor: BRAND_ORANGE }}
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Article
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {blogs.map((blog) => (
                                <MyBlogsCard
                                    key={blog._id}
                                    blog={blog}
                                    deletingId={deletingId}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                                showInfo={true}
                                scrollToTop={true}
                                className="mt-8"
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

