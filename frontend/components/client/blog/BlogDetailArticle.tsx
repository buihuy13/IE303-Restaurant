"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BlogComments from "@/components/client/blog/BlogComments";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants/blog";
import type { Blog } from "@/types/blog.type";

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

interface BlogDetailArticleProps {
    blog: Blog;
    liked: boolean;
    likesCount: number;
    onLike: () => void;
    onShare: () => void;
    onCommentAdded: () => void;
}

export function BlogDetailArticle({
    blog,
    liked,
    likesCount,
    onLike,
    onShare,
    onCommentAdded,
}: BlogDetailArticleProps) {
    return (
        <article className="lg:col-span-8">
            <div className="space-y-6">
                <header>
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-orange transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                        </Link>
                        {blog.category && (
                            <span className="inline-block px-3 py-1 bg-brand-orange text-white text-xs font-semibold rounded-full shadow-sm">
                                {BLOG_CATEGORY_LABELS[blog.category] ?? blog.category}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-2">
                        {blog.title}
                    </h1>
                    {blog.excerpt && (
                        <p className="text-lg text-gray-600 leading-relaxed mb-4 font-light">{blog.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-0 pb-4 border-b border-gray-200">
                        {blog.author?.avatar ? (
                            <Image
                                src={blog.author.avatar}
                                alt={blog.author.name ?? "Author"}
                                width={32}
                                height={32}
                                className="rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-brand-orange flex-shrink-0">
                                {blog.author?.name?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                        )}
                        <span className="font-medium text-gray-700">{blog.author?.name ?? "Author"}</span>
                        <span className="text-gray-300">•</span>
                        {blog.publishedAt && (
                            <>
                                <span>{formatDate(blog.publishedAt)}</span>
                                <span className="text-gray-300">•</span>
                            </>
                        )}
                        <span>{blog.readTime} min read</span>
                    </div>
                </header>

                {blog.featuredImage?.url && (
                    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl mt-6">
                        <Image
                            src={blog.featuredImage.url}
                            alt={blog.featuredImage.alt ?? blog.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {blog.tags.map((tag, index) => (
                            <span
                                key={`${tag}-${index}`}
                                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="prose prose-lg md:prose-xl max-w-none blog-content">
                    {blog.contentHtml ? (
                        <div
                            className="markdown-body"
                            dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
                        />
                    ) : (
                        <div className="markdown-body">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {blog.images && blog.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {blog.images.map((image, index) => (
                            <div
                                key={`img-${index}`}
                                className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                            >
                                <Image
                                    src={image.url}
                                    alt={image.alt ?? `Image ${index + 1}`}
                                    fill
                                    className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-6 pb-4 border-t border-gray-200 mt-6">
                    <button
                        type="button"
                        onClick={onLike}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium border-2 active:scale-125 whitespace-nowrap min-w-fit ${
                            liked
                                ? "bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-red-300 hover:text-red-500"
                        }`}
                    >
                        <Heart
                            className={`w-5 h-5 flex-shrink-0 transition-all ${
                                liked ? "fill-current text-red-600" : "text-gray-500"
                            }`}
                        />
                        <span className="font-semibold whitespace-nowrap">{likesCount}</span>
                    </button>
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl border-2 border-gray-300 whitespace-nowrap min-w-fit">
                        <MessageCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold whitespace-nowrap">{blog.commentsCount ?? 0}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onShare}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-brand-orange hover:text-brand-orange transition-all font-medium whitespace-nowrap min-w-fit"
                    >
                        <Share2 className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold whitespace-nowrap">Share</span>
                    </button>
                </div>

                <hr className="border-gray-100 my-6" />

                <div id="comments" className="mt-2">
                    <BlogComments blogId={blog._id} onCommentAdded={onCommentAdded} />
                </div>
            </div>
        </article>
    );
}
