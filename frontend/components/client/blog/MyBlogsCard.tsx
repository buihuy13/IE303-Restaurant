import Image from "next/image";
import Link from "next/link";
import { Calendar, Edit2, FileText, Trash2 } from "lucide-react";
import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import { getBlogExcerpt } from "@/lib/utils/blogText";
import type { Blog } from "@/types/blog.type";

function formatDate(dateString?: string | null) {
    if (!dateString) return "Unpublished";
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
    const statusInfo = BLOG_STATUS_LABELS[blog.status];
    const isDeleting = deletingId === blog.id;
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
                <Link href={`/blog/${blog.slug}`}>
                    <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-opacity hover:opacity-70">
                        {blog.title}
                    </h3>
                </Link>
                <p className="mb-4 line-clamp-3 text-sm text-gray-600">{getBlogExcerpt(blog.content)}</p>
                <div className="mb-4 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(blog.publishedAt ?? blog.updatedAt ?? blog.createdAt)}</span>
                </div>
                <div className="mt-auto flex items-center gap-2 border-t border-gray-200 pt-4">
                    <Link
                        href={`/blog/edit/${blog.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDelete(blog.id, blog.title)}
                        disabled={isDeleting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting ? "Archiving..." : "Archive"}
                    </button>
                </div>
            </div>
        </div>
    );
}
