import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import type { BlogViewModel } from "@/types/blogView.type";

function formatDate(dateString?: string | null) {
    if (!dateString) return "Unpublished";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

interface BlogListGridProps {
    blogs: BlogViewModel[];
}

interface BlogListPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const formatPage = (page: number) => String(page).padStart(2, "0");

export function BlogListPagination({ currentPage, totalPages, onPageChange }: BlogListPaginationProps) {
    if (totalPages <= 1) return null;

    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="flex items-center gap-4" aria-label="Blog pagination">
            <button
                type="button"
                aria-label="Previous page"
                disabled={!canGoPrevious}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-orange text-brand-orange transition hover:bg-brand-orange hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-300"
            >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            </button>
            <span className="min-w-[72px] text-center text-base font-black text-gray-950">
                {formatPage(currentPage)}
                <span className="px-1.5 font-medium text-gray-500">/</span>
                <span className="font-medium text-gray-950">{formatPage(totalPages)}</span>
            </span>
            <button
                type="button"
                aria-label="Next page"
                disabled={!canGoNext}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange text-white transition hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
                <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
            </button>
        </div>
    );
}

export function BlogListGrid({ blogs }: BlogListGridProps) {
    return (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog) => (
                <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="group block rounded-lg p-4 outline-none transition duration-300 hover:bg-green-100 focus-visible:bg-green-50 focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-4"
                >
                    <div className="relative aspect-[1.42] w-full overflow-hidden rounded-lg bg-gray-100">
                        {blog.coverImageUrl ? (
                            <Image
                                src={blog.coverImageUrl}
                                alt={blog.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                                <FileText className="h-12 w-12" />
                            </div>
                        )}
                    </div>
                    <div className="pt-5">
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500">
                            <span>{blog.category ?? BLOG_STATUS_LABELS[blog.status].label}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-400" />
                            <span>{formatDate(blog.publishedAt ?? blog.createdAt)}</span>
                        </div>
                        <h3 className="line-clamp-2 text-2xl font-bold leading-snug text-gray-900 transition-colors">
                            {blog.title}
                        </h3>
                        <div className="mt-6 inline-flex border-b border-brand-orange pb-1 text-sm font-bold text-brand-orange transition-colors group-hover:border-brand-orange/70 group-hover:text-brand-orange/80">
                            Read More
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
