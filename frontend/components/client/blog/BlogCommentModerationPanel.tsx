"use client";

import { Eye, EyeOff, MessageCircle } from "lucide-react";
import type { BlogComment, BlogCommentStatus } from "@/types/blog.type";
import Pagination from "@/components/client/Pagination";

interface BlogCommentModerationPanelProps {
    comments: BlogComment[];
    loading: boolean;
    page: number;
    totalPages: number;
    status: BlogCommentStatus | "";
    updatingId: string | null;
    onStatusFilterChange: (status: BlogCommentStatus | "") => void;
    onPageChange: (page: number) => void;
    onUpdateStatus: (commentId: string, status: BlogCommentStatus) => Promise<void>;
}

const statusOptions: Array<{ value: BlogCommentStatus | ""; label: string }> = [
    { value: "", label: "All comments" },
    { value: "PUBLISHED", label: "Published" },
    { value: "HIDDEN", label: "Hidden" },
    { value: "PENDING", label: "Pending" },
];

const formatDate = (value?: string | null) =>
    value
        ? new Date(value).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "Recently";

export function BlogCommentModerationPanel({
    comments,
    loading,
    page,
    totalPages,
    status,
    updatingId,
    onStatusFilterChange,
    onPageChange,
    onUpdateStatus,
}: BlogCommentModerationPanelProps) {
    return (
        <section className="mt-10 rounded-lg border border-green-100 bg-green-50/70 p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase text-green-800">
                        <MessageCircle className="h-4 w-4" />
                        Comment moderation
                    </div>
                    <h2 className="text-2xl font-black text-green-950">Review reader comments</h2>
                    <p className="mt-1 text-sm text-gray-600">Hide or restore comments on articles you can manage.</p>
                </div>
                <select
                    value={status}
                    onChange={(event) => onStatusFilterChange(event.target.value as BlogCommentStatus | "")}
                    className="h-11 rounded-lg border border-green-200 bg-white px-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                >
                    {statusOptions.map((option) => (
                        <option key={option.value || "all"} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="rounded-lg bg-white p-6 text-sm font-semibold text-gray-600">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-green-200 bg-white p-6 text-sm font-semibold text-gray-600">
                    No comments found for this filter.
                </div>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment) => {
                        const isHidden = comment.status === "HIDDEN";
                        const nextStatus: BlogCommentStatus = isHidden ? "PUBLISHED" : "HIDDEN";
                        return (
                            <article key={comment.id} className="rounded-lg border border-green-100 bg-white p-5">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            <p className="font-bold text-green-950">{comment.name}</p>
                                            <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
                                                {comment.status}
                                            </span>
                                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                        </div>
                                        <p className="max-w-4xl text-sm leading-6 text-gray-700">{comment.message}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onUpdateStatus(comment.id, nextStatus)}
                                        disabled={updatingId === comment.id}
                                        className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                            isHidden
                                                ? "border border-green-700 bg-white text-green-800 hover:bg-green-50"
                                                : "bg-brand-orange text-white hover:bg-brand-orange/90"
                                        }`}
                                    >
                                        {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        {isHidden ? "Restore" : "Hide"}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    showInfo={false}
                    scrollToTop={false}
                    className="mt-6"
                />
            )}
        </section>
    );
}
