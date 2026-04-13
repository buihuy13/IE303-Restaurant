"use client";

import Link from "next/link";
import { Archive, FileText, PenLine, Plus, Send } from "lucide-react";
import type { BlogStatus } from "@/types/blog.type";
import type { BlogDataSource, BlogViewModel } from "@/types/blogView.type";
import Pagination from "@/components/client/Pagination";
import { MyBlogsHeader } from "@/components/client/blog/MyBlogsHeader";
import { MyBlogsFilters } from "@/components/client/blog/MyBlogsFilters";
import { MyBlogsCard } from "@/components/client/blog/MyBlogsCard";
import type { MyBlogsStats } from "@/hooks/client/blog/useMyBlogsData";

export interface MyBlogsPageViewProps {
    loading: boolean;
    blogs: BlogViewModel[];
    totalPages: number;
    stats: MyBlogsStats;
    dataSource: BlogDataSource;
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
    stats,
    dataSource,
    page,
    status,
    deletingId,
    onStatusChange,
    onPageChange,
    onDelete,
}: MyBlogsPageViewProps) {
    const statItems = [
        { label: "All posts", value: stats.all, icon: FileText, tone: "text-gray-900" },
        { label: "Drafts", value: stats.draft, icon: PenLine, tone: "text-gray-700" },
        { label: "Published", value: stats.published, icon: Send, tone: "text-emerald-600" },
        { label: "Archived", value: stats.archived, icon: Archive, tone: "text-amber-600" },
    ];

    return (
        <div className="min-h-screen bg-white py-10">
            <div className="custom-container">
                <MyBlogsHeader dataSource={dataSource} />
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                    <Icon className={`h-5 w-5 ${item.tone}`} />
                                </div>
                                <p className={`text-3xl font-bold ${item.tone}`}>{item.value}</p>
                                <p className="mt-1 text-sm font-medium text-gray-500">{item.label}</p>
                            </div>
                        );
                    })}
                </div>
                <MyBlogsFilters status={status} stats={stats} onStatusChange={onStatusChange} />

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
