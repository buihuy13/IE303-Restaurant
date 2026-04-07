import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Edit2, Eye, Heart, Trash2 } from "lucide-react";
import { BLOG_CATEGORIES_SIMPLE, BLOG_STATUS_LABELS } from "@/lib/constants/blog";
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
    const statusClass =
        blog.status === "published"
            ? "bg-emerald-500"
            : blog.status === "archived"
              ? "bg-amber-500"
              : "bg-gray-600";

    return (
        <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)]">
            <div className="relative w-full aspect-[4/3] overflow-hidden">
                {blog.featuredImage?.url ? (
                    <Image
                        src={blog.featuredImage.url}
                        alt={blog.featuredImage.alt || blog.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-orange/15">
                        <span className="text-4xl">🍽️</span>
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${statusClass}`}>
                        {statusInfo.label}
                    </span>
                </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
                <span className="mb-3 inline-block w-fit rounded-full bg-brand-orange px-3 py-1 text-xs font-semibold text-white">
                    {categoryLabel}
                </span>
                <Link href={`/blog/${blog.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:opacity-70 transition-opacity">
                        {blog.title}
                    </h3>
                </Link>
                <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
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
                    <div className="mb-4 flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(blog.publishedAt)}</span>
                    </div>
                )}
                <div className="mt-auto flex items-center gap-2 border-t border-gray-200 pt-4">
                    <Link
                        href={`/blog/edit/${blog._id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDelete(blog._id, blog.title)}
                        disabled={isDeleting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
