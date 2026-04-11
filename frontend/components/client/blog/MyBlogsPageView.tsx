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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
            <div className="custom-container">
                <MyBlogsHeader />
                <MyBlogsFilters status={status} onStatusChange={onStatusChange} />

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="mx-auto max-w-md rounded-3xl border border-gray-200/90 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-brand-orange" />
                            <p className="mt-4 text-gray-600">Loading...</p>
                        </div>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="rounded-3xl border border-gray-200/90 bg-white py-12 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                        <p className="mb-4 text-gray-600">No articles found</p>
                        <Link
                            href="/blog/create"
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-orange/90"
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
