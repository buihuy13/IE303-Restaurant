import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Edit2, Eye, Heart, Trash2 } from "lucide-react";
import { BLOG_CATEGORIES_SIMPLE, BLOG_STATUS_LABELS, BRAND_ORANGE } from "@/lib/constants/blog";
import type { Blog } from "@/types/blog.type";

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

interface MyBlogsCardProps {
    blog: Blog;
    deletingId: string | null;
    onDelete: (blogId: string, title: string) => void;
}

export function MyBlogsCard({ blog, deletingId, onDelete }: MyBlogsCardProps) {
    const categoryLabel = BLOG_CATEGORIES_SIMPLE.find((c) => c.value === blog.category)?.label ?? "Other";
    const statusInfo = BLOG_STATUS_LABELS[blog.status];
    const isDeleting = deletingId === blog._id;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="relative w-full aspect-[4/3] overflow-hidden">
                {blog.featuredImage?.url ? (
                    <Image
                        src={blog.featuredImage.url}
                        alt={blog.featuredImage.alt || blog.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: BRAND_ORANGE + "20" }}
                    >
                        <span className="text-4xl">🍽️</span>
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <span
                        className="px-3 py-1 text-white text-xs font-semibold rounded-full"
                        style={{ backgroundColor: statusInfo.color }}
                    >
                        {statusInfo.label}
                    </span>
                </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <span
                    className="inline-block px-3 py-1 text-white text-xs font-semibold rounded-full mb-3 w-fit"
                    style={{ backgroundColor: BRAND_ORANGE }}
                >
                    {categoryLabel}
                </span>
                <Link href={`/blog/${blog.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:opacity-70 transition-opacity">
                        {blog.title}
                    </h3>
                </Link>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{blog.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{blog.likesCount ?? blog.likes?.length ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{blog.readTime} min</span>
                    </div>
                </div>
                {blog.publishedAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(blog.publishedAt)}</span>
                    </div>
                )}
                <div className="mt-auto pt-4 border-t border-gray-200 flex items-center gap-2">
                    <Link
                        href={`/blog/edit/${blog._id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDelete(blog._id, blog.title)}
                        disabled={isDeleting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
