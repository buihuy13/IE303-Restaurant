"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { BlogListHeader } from "@/components/client/blog/BlogListHeader";
import { BlogListSearch } from "@/components/client/blog/BlogListSearch";
import { BlogListCategories } from "@/components/client/blog/BlogListCategories";
import { BlogListFeatured } from "@/components/client/blog/BlogListFeatured";
import { BlogListGrid } from "@/components/client/blog/BlogListGrid";
import { BlogListEmpty } from "@/components/client/blog/BlogListEmpty";
import { BlogListLoading } from "@/components/client/blog/BlogListLoading";
import { useBlogListData } from "@/hooks/client/blog/useBlogListData";
import { useBlogListFilters } from "@/hooks/client/blog/useBlogListFilters";
import { useBlogListFeatured } from "@/hooks/client/blog/useBlogListFeatured";

export default function BlogPageClient() {
    const { isAuthenticated } = useAuthStore();
    const filters = useBlogListFilters();
    const { blogs, loading, totalPages } = useBlogListData(
        filters.page,
        filters.category,
        filters.search,
    );
    const { featuredBlog, regularBlogs } = useBlogListFeatured(blogs);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
                <div className="mb-10">
                    <BlogListHeader isAuthenticated={!!isAuthenticated} />
                    <BlogListSearch
                        searchInput={filters.searchInput}
                        onSearchInputChange={filters.setSearchInput}
                        onSearch={filters.handleSearch}
                    />
                    <BlogListCategories
                        category={filters.category}
                        onCategoryChange={filters.handleCategoryChange}
                    />
                </div>

                {loading ? (
                    <BlogListLoading />
                ) : blogs.length === 0 ? (
                    <BlogListEmpty />
                ) : (
                    <>
                        {featuredBlog?.featuredImage?.url && (
                            <BlogListFeatured blog={featuredBlog} />
                        )}
                        {regularBlogs.length > 0 && (
                            <BlogListGrid
                                blogs={regularBlogs}
                                currentPage={filters.page}
                                totalPages={totalPages}
                                onPageChange={filters.handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
