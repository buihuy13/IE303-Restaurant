"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import { getMarkdownHeadings, toMarkdownHeadingId } from "@/lib/utils/blogText";
import type { BlogViewModel } from "@/types/blogView.type";

function formatDate(dateString?: string | null) {
    if (!dateString) return "Unpublished";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function getHeadingText(children: ReactNode) {
    if (Array.isArray(children)) return children.join("");
    return String(children ?? "");
}

interface BlogDetailArticleProps {
    blog: BlogViewModel;
    relatedPosts: BlogViewModel[];
    previousPost: BlogViewModel | null;
    nextPost: BlogViewModel | null;
    copied: boolean;
    onShare: () => void;
}

function ArticleNavCard({
    post,
    label,
    align = "left",
}: {
    post: BlogViewModel | null;
    label: string;
    align?: "left" | "right";
}) {
    if (!post) {
        return (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
                No {label.toLowerCase()} available
            </div>
        );
    }

    return (
        <Link
            href={`/blog/${post.slug}`}
            className={`group rounded-lg border border-gray-200 bg-white p-5 transition hover:border-brand-orange/50 hover:shadow-lg ${
                align === "right" ? "text-right" : ""
            }`}
        >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">{label}</p>
            <p className="mt-3 line-clamp-2 text-base font-bold leading-6 text-gray-950 group-hover:text-brand-orange">
                {post.title}
            </p>
            <p className="mt-2 text-sm text-gray-500">{post.readTime} min read</p>
        </Link>
    );
}

export function BlogDetailArticle({ blog, relatedPosts, previousPost, nextPost, copied, onShare }: BlogDetailArticleProps) {
    const headings = getMarkdownHeadings(blog.content);
    const hasMetrics =
        typeof blog.views === "number" || typeof blog.likes === "number" || typeof blog.commentsCount === "number";

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
                    <p className="mb-5 text-lg leading-8 text-gray-600">{blog.excerpt}</p>
                    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-5 text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                            {blog.author.avatarUrl && (
                                <Image
                                    src={blog.author.avatarUrl}
                                    alt={blog.author.name}
                                    width={44}
                                    height={44}
                                    className="rounded-lg object-cover"
                                />
                            )}
                            <div>
                                <p className="font-semibold text-gray-950">{blog.author.name}</p>
                                <p>{blog.author.role}</p>
                            </div>
                        </div>
                        <span className="hidden h-8 w-px bg-gray-200 sm:block" />
                        <span className="inline-flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(blog.publishedAt ?? blog.createdAt)}
                        </span>
                        <span>{blog.readTime} min read</span>
                        <button
                            type="button"
                            onClick={onShare}
                            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-all hover:border-brand-orange hover:bg-gray-50 hover:text-brand-orange"
                        >
                            <Share2 className="h-4 w-4" />
                            {copied ? "Copied" : "Share"}
                        </button>
                    </div>
                </header>

                {blog.coverImageUrl && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                        <Image src={blog.coverImageUrl} alt={blog.title} fill className="object-cover" priority />
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-28 space-y-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <button
                                type="button"
                                onClick={onShare}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-brand-orange hover:bg-gray-50 hover:text-brand-orange"
                            >
                                <Share2 className="h-4 w-4" />
                                {copied ? "Copied" : "Share story"}
                            </button>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">In this story</p>
                                <div className="mt-4 space-y-2">
                                    {headings.length > 0 ? (
                                        headings.map((heading) => (
                                            <a
                                                key={heading.id}
                                                href={`#${heading.id}`}
                                                className={`block text-sm leading-6 text-gray-700 hover:text-brand-orange ${
                                                    heading.level === 3 ? "pl-3" : ""
                                                }`}
                                            >
                                                {heading.text}
                                            </a>
                                        ))
                                    ) : (
                                        <p className="text-sm leading-6 text-gray-600">A short read from the FoodEats table.</p>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4 text-sm text-gray-600">
                                {blog.category && <p className="font-semibold text-gray-950">{blog.category}</p>}
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {blog.tags.map((tag) => (
                                        <span key={tag} className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {hasMetrics && (
                                <div className="grid grid-cols-3 gap-2 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
                                    <div>
                                        <p className="font-bold text-gray-950">{(blog.views ?? 0).toLocaleString()}</p>
                                        <p>Views</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-950">{(blog.likes ?? 0).toLocaleString()}</p>
                                        <p>Likes</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-950">{(blog.commentsCount ?? 0).toLocaleString()}</p>
                                        <p>Talks</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    <div className="prose prose-lg blog-content max-w-none">
                        <div className="markdown-body">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h2: ({ children }: { children?: ReactNode }) => {
                                        const id = toMarkdownHeadingId(getHeadingText(children));
                                        return <h2 id={id}>{children}</h2>;
                                    },
                                    h3: ({ children }: { children?: ReactNode }) => {
                                        const id = toMarkdownHeadingId(getHeadingText(children));
                                        return <h3 id={id}>{children}</h3>;
                                    },
                                }}
                            >
                                {blog.content}
                            </ReactMarkdown>
                        </div>

                        {hasMetrics && (
                            <div className="not-prose mt-10 flex flex-wrap gap-3 border-t border-gray-200 pt-6 text-sm text-gray-600">
                                {typeof blog.views === "number" && (
                                    <span className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                                        <Eye className="h-4 w-4" />
                                        {blog.views.toLocaleString()} views
                                    </span>
                                )}
                                {typeof blog.likes === "number" && (
                                    <span className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                                        <Heart className="h-4 w-4" />
                                        {blog.likes.toLocaleString()} likes
                                    </span>
                                )}
                                {typeof blog.commentsCount === "number" && (
                                    <span className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                                        <MessageCircle className="h-4 w-4" />
                                        {blog.commentsCount.toLocaleString()} comments
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <section className="border-t border-gray-200 pt-10">
                    <div className="grid gap-5 md:grid-cols-2">
                        <ArticleNavCard post={previousPost} label="Previous story" />
                        <ArticleNavCard post={nextPost} label="Next story" align="right" />
                    </div>
                </section>

                {relatedPosts.length > 0 && (
                    <section className="border-t border-gray-200 pt-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">More stories</p>
                        <div className="mt-5 grid gap-5 md:grid-cols-3">
                            {relatedPosts.map((post) => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-orange/50 hover:shadow-lg">
                                    <p className="text-sm font-semibold leading-6 text-gray-950 group-hover:text-brand-orange">{post.title}</p>
                                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{post.excerpt}</p>
                                    <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                                        {post.readTime} min read <ArrowRight className="h-3.5 w-3.5" />
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </article>
    );
}
