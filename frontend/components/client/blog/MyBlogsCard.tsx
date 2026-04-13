import Image from "next/image";
import Link from "next/link";
import { Calendar, Edit2, Eye, FileText, Heart, MessageCircle, Trash2 } from "lucide-react";
import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import type { BlogViewModel } from "@/types/blogView.type";

function formatDate(dateString?: string | null) {
    if (!dateString) return "Unpublished";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

interface MyBlogsCardProps {
    blog: BlogViewModel;
    deletingId: string | null;
    onDelete: (blogId: string, title: string) => void;
}

export function MyBlogsCard({ blog, deletingId, onDelete }: MyBlogsCardProps) {
    const statusInfo = BLOG_STATUS_LABELS[blog.status];
    const isDeleting = deletingId === blog.id;
    const isArchived = blog.status === "ARCHIVED";
    const canViewPublicPost = blog.status === "PUBLISHED";
    const hasMetrics =
        typeof blog.views === "number" || typeof blog.likes === "number" || typeof blog.commentsCount === "number";
    const statusClass =
        blog.status === "PUBLISHED" ? "bg-emerald-500" : blog.status === "ARCHIVED" ? "bg-amber-500" : "bg-gray-600";

    return (
        <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-lg">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                {blog.coverImageUrl ? (
                    <Image src={blog.coverImageUrl} alt={blog.title} fill className="object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                        <FileText className="h-12 w-12" />
                    </div>
                )}
                <div className="absolute right-3 top-3">
                    <span className={`rounded-md px-3 py-1 text-xs font-semibold text-white ${statusClass}`}>
                        {statusInfo.label}
                    </span>
                </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-950">{blog.title}</h3>
                <p className="mb-4 line-clamp-3 text-sm leading-6 text-gray-600">{blog.excerpt}</p>
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
                    {blog.category && <span className="rounded-md bg-gray-100 px-2.5 py-1 text-gray-700">{blog.category}</span>}
                    <span>{blog.readTime} min read</span>
                </div>
                <div className="mb-4 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(blog.publishedAt ?? blog.updatedAt ?? blog.createdAt)}</span>
                </div>
                {hasMetrics && (
                    <div className="mb-4 flex flex-wrap gap-2 text-xs text-gray-500">
                        {typeof blog.views === "number" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1">
                                <Eye className="h-3.5 w-3.5" />
                                {blog.views.toLocaleString()}
                            </span>
                        )}
                        {typeof blog.likes === "number" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1">
                                <Heart className="h-3.5 w-3.5" />
                                {blog.likes.toLocaleString()}
                            </span>
                        )}
                        {typeof blog.commentsCount === "number" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1">
                                <MessageCircle className="h-3.5 w-3.5" />
                                {blog.commentsCount.toLocaleString()}
                            </span>
                        )}
                    </div>
                )}
                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-gray-200 pt-4">
                    {canViewPublicPost && (
                        <Link
                            href={`/blog/${blog.slug}`}
                            className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-brand-orange hover:bg-gray-50 hover:text-brand-orange"
                        >
                            <Eye className="h-4 w-4" />
                            View published post
                        </Link>
                    )}
                    <Link
                        href={`/blog/edit/${blog.id}`}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDelete(blog.id, blog.title)}
                        disabled={isDeleting || isArchived}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting ? "Archiving..." : isArchived ? "Archived" : "Archive"}
                    </button>
                </div>
            </div>
        </div>
    );
}
