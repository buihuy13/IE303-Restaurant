import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, FileText } from "lucide-react";
import Pagination from "@/components/client/Pagination";
import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import { getBlogExcerpt } from "@/lib/utils/blogText";
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
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function BlogListGrid({ blogs, currentPage, totalPages, onPageChange }: BlogListGridProps) {
    return (
        <>
            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {blogs.map((blog) => (
                    <Link
                        key={blog.id}
                        href={`/blog/${blog.slug}`}
                        className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-lg"
                    >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
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
                            <div className="absolute left-4 top-4">
                                <span className="rounded-md bg-brand-orange px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                                    {blog.category ?? BLOG_STATUS_LABELS[blog.status].label}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
                                <span>{blog.author.name}</span>
                                <span>|</span>
                                <span>{blog.readTime} min read</span>
                                {typeof blog.commentsCount === "number" && (
                                    <>
                                        <span>|</span>
                                        <span>{blog.commentsCount} comments</span>
                                    </>
                                )}
                            </div>
                            <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-brand-orange">
                                {blog.title}
                            </h3>
                            <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-600">
                                {getBlogExcerpt(blog.content)}
                            </p>
                            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(blog.publishedAt ?? blog.createdAt)}</span>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-brand-orange" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        showInfo={true}
                        scrollToTop={true}
                    />
                </div>
            )}
        </>
    );
}
