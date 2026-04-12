"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { Blog, BlogStatus } from "@/types/blog.type";
import Pagination from "@/components/client/Pagination";
import { MyBlogsHeader } from "@/components/client/blog/MyBlogsHeader";
import { MyBlogsFilters } from "@/components/client/blog/MyBlogsFilters";
import { MyBlogsCard } from "@/components/client/blog/MyBlogsCard";

export interface MyBlogsPageViewProps {
    loading: boolean;
    blogs: Blog[];
    totalPages: number;
    page: number;
    status: BlogStatus | "";
    deletingId: string | null;
    onStatusChange: (status: BlogStatus | "") => void;
    onPageChange: (page: number) => void;
    onDelete: (blogId: string, title: string) => Promise<void>;
}

export function MyBlogsPageView({
    loading,
    blogs,
    totalPages,
    page,
    status,
    deletingId,
    onStatusChange,
    onPageChange,
    onDelete,
}: MyBlogsPageViewProps) {
    return (
        <div className="min-h-screen bg-white py-8">
            <div className="custom-container">
                <MyBlogsHeader />
                <MyBlogsFilters status={status} onStatusChange={onStatusChange} />

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-brand-orange" />
                            <p className="mt-4 text-gray-600">Loading...</p>
                        </div>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                        <p className="mb-4 text-gray-600">No articles found</p>
                        <Link
                            href="/blog/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-orange/90"
                        >
                            <Plus className="h-5 w-5" />
                            Create Your First Article
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {blogs.map((blog) => (
                                <MyBlogsCard
                                    key={blog.id}
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
