"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Pagination from "@/components/client/Pagination";
import { useAuthStore } from "@/stores/useAuthStore";
import { MyBlogsHeader } from "@/components/client/blog/MyBlogsHeader";
import { MyBlogsFilters } from "@/components/client/blog/MyBlogsFilters";
import { MyBlogsCard } from "@/components/client/blog/MyBlogsCard";
import { useMyBlogsData } from "@/hooks/client/blog/useMyBlogsData";
import { useMyBlogsFilters } from "@/hooks/client/blog/useMyBlogsFilters";
import { useMyBlogsActions } from "@/hooks/client/blog/useMyBlogsActions";
import { BRAND_ORANGE } from "@/lib/constants/blog";

export default function MyBlogsPageClient() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const filters = useMyBlogsFilters();
    const { blogs, loading, totalPages, fetchMyBlogs } = useMyBlogsData(
        user?.id,
        filters.page,
        filters.category,
        filters.status,
        filters.search,
    );
    const { handleDelete } = useMyBlogsActions(fetchMyBlogs);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    if (!isAuthenticated || !user) {
        router.push("/login");
        return null;
    }

    const onDelete = async (blogId: string, title: string) => {
        setDeletingId(blogId);
        try {
            await handleDelete(blogId, title);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="custom-container">
                <MyBlogsHeader />
                <MyBlogsFilters
                    searchInput={filters.searchInput}
                    onSearchInputChange={filters.setSearchInput}
                    onSearch={filters.handleSearch}
                    category={filters.category}
                    onCategoryChange={filters.handleCategoryChange}
                    status={filters.status}
                    onStatusChange={filters.handleStatusChange}
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
                                currentPage={filters.page}
                                totalPages={totalPages}
                                onPageChange={filters.handlePageChange}
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
