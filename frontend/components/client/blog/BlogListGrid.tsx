import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Eye, Heart } from "lucide-react";
import Pagination from "@/components/client/Pagination";
import { BLOG_CATEGORIES, BRAND_ORANGE } from "@/lib/constants/blog";
import type { Blog } from "@/types/blog.type";

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

interface BlogListGridProps {
    blogs: Blog[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function BlogListGrid({ blogs, currentPage, totalPages, onPageChange }: BlogListGridProps) {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                {blogs.map((blog) => (
                    <Link
                        key={blog._id}
                        href={`/blog/${blog.slug}`}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col border border-gray-100"
                    >
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                            {blog.featuredImage?.url ? (
                                <Image
                                    src={blog.featuredImage.url}
                                    alt={blog.featuredImage.alt || blog.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: BRAND_ORANGE + "15" }}
                                >
                                    <span className="text-5xl">🍽️</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span
                                    className="px-3 py-1.5 text-white text-xs font-bold rounded-full backdrop-blur-md shadow-lg"
                                    style={{ backgroundColor: BRAND_ORANGE }}
                                >
                                    {BLOG_CATEGORIES.find((c) => c.value === blog.category)?.label ?? "Other"}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#EE4D2D] transition-colors">
                                {blog.title}
                            </h3>
                            {blog.excerpt && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{blog.excerpt}</p>
                            )}
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        <span>{blog.views}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Heart className="w-4 h-4 text-red-500" />
                                        <span>{blog.likesCount ?? blog.likes?.length ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{blog.readTime} min</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    {blog.author?.avatar ? (
                                        <Image
                                            src={blog.author.avatar}
                                            alt={blog.author?.name ?? "Author"}
                                            width={36}
                                            height={36}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                                            style={{ backgroundColor: BRAND_ORANGE }}
                                        >
                                            {blog.author?.name?.charAt(0).toUpperCase() ?? "?"}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {blog.author?.name ?? "Author"}
                                        </span>
                                        {blog.publishedAt && (
                                            <span className="text-xs text-gray-500">
                                                {formatDate(blog.publishedAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#EE4D2D] group-hover:translate-x-1 transition-all" />
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
