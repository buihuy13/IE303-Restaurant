"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BlogDetailComments } from "@/components/client/blog/BlogDetailComments";
import { BlogListGrid } from "@/components/client/blog/BlogListGrid";
import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import { getMarkdownHeadings, toMarkdownHeadingId } from "@/lib/utils/blogText";
import type { BlogViewModel } from "@/types/blogView.type";

interface MarkdownImage {
    alt: string;
    url: string;
}

interface BlogDetailArticleProps {
    blog: BlogViewModel;
    relatedPosts: BlogViewModel[];
    previousPost: BlogViewModel | null;
    nextPost: BlogViewModel | null;
    copied: boolean;
    onShare: () => void;
    likedByCurrentUser: boolean;
    liking: boolean;
    onToggleLike: () => void;
    onCommentCreated: (nextCommentsCount: number) => void;
}

const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;

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

function getInitials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function extractMarkdownImages(content: string): MarkdownImage[] {
    return Array.from(content.matchAll(MARKDOWN_IMAGE_PATTERN)).map((match) => ({
        alt: match[1] || "Blog image",
        url: match[2],
    }));
}

function removePromotedImages(content: string, promotedUrls: Set<string>) {
    if (promotedUrls.size === 0) return content;
    return content.replace(MARKDOWN_IMAGE_PATTERN, (match, _alt: string, url: string) =>
        promotedUrls.has(url) ? "" : match,
    );
}

function ArticleNavCard({ post, label, direction = "next" }: { post: BlogViewModel | null; label: string; direction?: "previous" | "next" }) {
    if (!post) return null;

    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5 transition hover:border-brand-orange hover:bg-orange-50"
        >
            {direction === "previous" && (
                <ArrowLeft className="h-5 w-5 shrink-0 text-brand-orange transition group-hover:-translate-x-1" />
            )}
            <div className={direction === "previous" ? "text-right" : ""}>
                <p className="text-xs font-bold uppercase text-brand-orange">{label}</p>
                <p className="mt-2 line-clamp-2 font-bold leading-6 text-gray-950 transition group-hover:text-brand-orange">
                    {post.title}
                </p>
            </div>
            {direction === "next" && (
                <ArrowRight className="h-5 w-5 shrink-0 text-brand-orange transition group-hover:translate-x-1" />
            )}
        </Link>
    );
}

function DetailInfoRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-6 py-3 text-sm">
            <span className="font-semibold uppercase text-gray-700">{label}</span>
            <span className="text-right font-medium text-gray-700">{value}</span>
        </div>
    );
}

const metricShellClassName =
    "flex min-h-[88px] w-full flex-col items-center justify-start rounded-lg px-2 py-1 text-center";

function MetricShell({ children }: { children: ReactNode }) {
    return (
        <div className={metricShellClassName}>
            {children}
        </div>
    );
}

function MetricButton({
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
    return (
        <button
            type="button"
            className={`${metricShellClassName} group cursor-pointer transition hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-70`}
            {...props}
        >
            {children}
        </button>
    );
}

function MetricIcon({ children }: { children: ReactNode }) {
    return <span className="flex h-5 items-center justify-center">{children}</span>;
}

function MetricValue({ children }: { children: ReactNode }) {
    return <span className="mt-2 block h-6 text-base font-bold leading-6 text-gray-950">{children}</span>;
}

function MetricLabel({ children }: { children: ReactNode }) {
    return <span className="mt-1 block leading-5">{children}</span>;
}

export function BlogDetailArticle({
    blog,
    relatedPosts,
    previousPost,
    nextPost,
    copied,
    onShare,
    likedByCurrentUser,
    liking,
    onToggleLike,
    onCommentCreated,
}: BlogDetailArticleProps) {
    const markdownImages = extractMarkdownImages(blog.content);
    const heroImageUrl = blog.coverImageUrl || markdownImages[0]?.url || null;
    const mediaImages = markdownImages
        .filter((image) => image.url !== heroImageUrl)
        .slice(0, 2);
    const promotedImageUrls = new Set(
        [heroImageUrl, ...mediaImages.map((image) => image.url)].filter(Boolean) as string[],
    );
    const contentWithoutPromotedImages = removePromotedImages(blog.content, promotedImageUrls);
    const headings = getMarkdownHeadings(contentWithoutPromotedImages);
    const hasMetrics =
        typeof blog.views === "number" || typeof blog.likes === "number" || typeof blog.commentsCount === "number";
    const categoryLabel = blog.category ?? BLOG_STATUS_LABELS[blog.status].label;

    return (
        <article className="mx-auto max-w-7xl">
            <div className="space-y-14">
                <header className="overflow-hidden rounded-lg bg-orange-50">
                    <div className="relative aspect-[16/7] min-h-[300px]">
                        {heroImageUrl ? (
                            <Image src={heroImageUrl} alt={blog.title} fill className="object-cover" priority />
                        ) : (
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(238,77,45,0.35),transparent_34%),linear-gradient(135deg,#7c2d12,#ee4d2d)]" />
                        )}
                        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/25 to-transparent" />
                        <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center justify-between gap-3 sm:left-6 sm:right-6 sm:top-6">
                            <Link
                                href="/blog"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-orange"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Blog
                            </Link>
                            <button
                                type="button"
                                onClick={onShare}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-orange/90"
                            >
                                <Share2 className="h-4 w-4" />
                                {copied ? "Copied" : "Share"}
                            </button>
                        </div>
                    </div>
                </header>

                <section className="mx-auto max-w-5xl text-center">
                    <h2 className="text-3xl font-black leading-tight text-brand-orange md:text-5xl">{blog.title}</h2>
                    <p className="mx-auto mt-5 max-w-4xl text-lg leading-8 text-gray-700">{blog.excerpt}</p>
                </section>

                {mediaImages.length > 0 && (
                    <section className={`grid gap-5 ${mediaImages.length > 1 ? "md:grid-cols-2" : ""}`}>
                        {mediaImages.map((image) => (
                            <div key={image.url} className="relative aspect-[1.45] overflow-hidden rounded-lg bg-gray-100">
                                <Image src={image.url} alt={image.alt} fill className="object-cover" />
                            </div>
                        ))}
                    </section>
                )}

                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                    <div className="blog-content max-w-none">
                        <div className="markdown-body">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h2: ({ children }: { children?: ReactNode }) => {
                                        const id = toMarkdownHeadingId(getHeadingText(children));
                                        return (
                                            <h2 id={id} className="!border-b-0 !pb-0 !text-2xl !text-gray-900 md:!text-3xl">
                                                {children}
                                            </h2>
                                        );
                                    },
                                    h3: ({ children }: { children?: ReactNode }) => {
                                        const id = toMarkdownHeadingId(getHeadingText(children));
                                        return (
                                            <h3 id={id} className="!text-xl !text-gray-900 md:!text-2xl">
                                                {children}
                                            </h3>
                                        );
                                    },
                                }}
                            >
                                {contentWithoutPromotedImages}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <aside className="space-y-5 lg:sticky lg:top-24">
                        <section className="rounded-lg bg-orange-50 p-6">
                            <h2 className="border-b border-brand-orange/20 pb-4 text-sm font-black uppercase text-gray-950">
                                Details
                            </h2>
                            <div className="divide-y divide-brand-orange/10">
                                <DetailInfoRow label="Date" value={formatDate(blog.publishedAt ?? blog.createdAt)} />
                                <DetailInfoRow label="Category" value={categoryLabel} />
                                <DetailInfoRow label="Reading" value={`${blog.readTime} minutes`} />
                            </div>
                            {hasMetrics && (
                                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-brand-orange/20 pt-4 text-center text-xs text-gray-600">
                                    {typeof blog.views === "number" && (
                                        <MetricShell>
                                            <MetricIcon>
                                                <Eye className="h-4 w-4 text-brand-orange" />
                                            </MetricIcon>
                                            <MetricValue>{blog.views.toLocaleString()}</MetricValue>
                                            <MetricLabel>Views</MetricLabel>
                                        </MetricShell>
                                    )}
                                    {typeof blog.likes === "number" && (
                                        <MetricButton
                                            onClick={onToggleLike}
                                            disabled={liking}
                                            aria-pressed={likedByCurrentUser}
                                            aria-label={likedByCurrentUser ? "Unlike this story" : "Like this story"}
                                        >
                                            <MetricIcon>
                                                <Heart
                                                    className={`h-4 w-4 transition ${
                                                        likedByCurrentUser
                                                            ? "fill-brand-orange text-brand-orange"
                                                            : "text-gray-900 group-hover:text-brand-orange"
                                                    }`}
                                                />
                                            </MetricIcon>
                                            <MetricValue>{blog.likes.toLocaleString()}</MetricValue>
                                            <MetricLabel>{likedByCurrentUser ? "Liked" : "Likes"}</MetricLabel>
                                        </MetricButton>
                                    )}
                                    {typeof blog.commentsCount === "number" && (
                                        <MetricShell>
                                            <MetricIcon>
                                                <MessageCircle className="h-4 w-4 text-brand-orange" />
                                            </MetricIcon>
                                            <MetricValue>{blog.commentsCount.toLocaleString()}</MetricValue>
                                            <MetricLabel>Talks</MetricLabel>
                                        </MetricShell>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="rounded-lg bg-orange-50 p-6">
                            <h2 className="border-b border-brand-orange/20 pb-4 text-sm font-black uppercase text-gray-950">
                                Author
                            </h2>
                            <div className="mt-6 flex items-center gap-4">
                                {blog.author.avatarUrl ? (
                                    <Image
                                        src={blog.author.avatarUrl}
                                        alt={blog.author.name}
                                        width={48}
                                        height={48}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-black text-brand-orange">
                                        {getInitials(blog.author.name)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-950">{blog.author.name}</p>
                                    <p className="text-sm text-gray-600">{blog.author.role}</p>
                                </div>
                            </div>
                            <p className="mt-5 leading-7 text-gray-700">
                                Field notes and practical restaurant ideas from the FoodEats editorial table.
                            </p>
                            <button
                                type="button"
                                onClick={onShare}
                                className="mt-5 inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-brand-orange bg-white px-5 text-sm font-bold text-brand-orange transition hover:bg-brand-orange hover:text-white"
                            >
                                {copied ? "Copied" : "Share Article"}
                            </button>
                        </section>

                        {(blog.tags.length > 0 || headings.length > 0) && (
                            <section className="rounded-lg bg-white p-1">
                                {blog.tags.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="border-b border-gray-200 pb-3 text-sm font-black uppercase text-gray-950">
                                            Tagline
                                        </h2>
                                        <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
                                            {blog.tags.map((tag) => (
                                                <span key={tag} className="rounded-lg bg-orange-50 px-3 py-1.5 font-medium text-brand-orange">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {headings.length > 0 && (
                                    <div>
                                        <h2 className="border-b border-gray-200 pb-3 text-sm font-black uppercase text-gray-950">
                                            In This Story
                                        </h2>
                                        <div className="mt-4 space-y-2">
                                            {headings.slice(0, 6).map((heading) => (
                                                <a
                                                    key={heading.id}
                                                    href={`#${heading.id}`}
                                                    className={`block text-sm leading-6 text-gray-600 transition hover:text-brand-orange ${
                                                        heading.level === 3 ? "pl-3" : ""
                                                    }`}
                                                >
                                                    {heading.text}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </aside>
                </div>

                {(previousPost || nextPost) && (
                    <section className="grid gap-4 border-t border-gray-200 pt-10 md:grid-cols-2">
                        <ArticleNavCard post={previousPost} label="Previous Story" direction="previous" />
                        <ArticleNavCard post={nextPost} label="Next Story" />
                    </section>
                )}

                <BlogDetailComments
                    blogId={blog.id}
                    blogSlug={blog.slug}
                    liveCommentsCount={blog.commentsCount}
                    onCommentCreated={onCommentCreated}
                />

                {relatedPosts.length > 0 && (
                    <section className="border-t border-gray-200 pt-12">
                        <div className="mb-8">
                            <p className="flex items-center gap-2 text-sm font-bold uppercase text-brand-orange">
                                <span className="h-2 w-2 rounded-full bg-brand-orange" />
                                Related Articles
                            </p>
                            <h2 className="mt-4 text-4xl font-black uppercase text-brand-orange md:text-5xl">
                                You Might Also Like
                            </h2>
                        </div>
                        <BlogListGrid blogs={relatedPosts.slice(0, 3)} />
                    </section>
                )}
            </div>
        </article>
    );
}
