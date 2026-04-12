"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import type { Blog } from "@/types/blog.type";

function formatDate(dateString?: string | null) {
    if (!dateString) return "Unpublished";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

interface BlogDetailArticleProps {
    blog: Blog;
    onShare: () => void;
}

export function BlogDetailArticle({ blog, onShare }: BlogDetailArticleProps) {
    return (
        <article className="mx-auto max-w-5xl">
            <div className="space-y-10">
                <header className="mx-auto max-w-3xl">
                    <div className="mb-5 flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-brand-orange"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back</span>
                        </Link>
                        <span className="inline-block rounded-md bg-brand-orange px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            {BLOG_STATUS_LABELS[blog.status].label}
                        </span>
                    </div>
                    <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-gray-950 md:text-5xl lg:text-6xl">
                        {blog.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-4 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(blog.publishedAt ?? blog.createdAt)}</span>
                        <button
                            type="button"
                            onClick={onShare}
                            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-all hover:border-brand-orange hover:bg-gray-50 hover:text-brand-orange"
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </button>
                    </div>
                </header>

                {blog.coverImageUrl && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                        <Image src={blog.coverImageUrl} alt={blog.title} fill className="object-cover" priority />
                    </div>
                )}

                <div className="prose prose-lg blog-content mx-auto max-w-3xl">
                    <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </article>
    );
}
