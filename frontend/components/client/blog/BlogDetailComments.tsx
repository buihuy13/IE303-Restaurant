"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BlogListPagination } from "@/components/client/blog/BlogListGrid";
import { blogApi } from "@/lib/api/blogApi";
import { BLOG_DATA_SOURCE } from "@/lib/config/publicRuntime";
import { useAuthStore } from "@/stores/useAuthStore";
import type { BlogComment } from "@/types/blog.type";

interface BlogDetailComment {
    id: string;
    name: string;
    email?: string | null;
    message: string;
    createdAt: string;
    avatarUrl?: string;
}

interface BlogDetailCommentsProps {
    blogId: string;
    blogSlug: string;
    liveCommentsCount?: number;
    onCommentCreated?: (nextCommentsCount: number) => void;
}

interface CommentFormState {
    message: string;
    notify: boolean;
}

type CommentFormErrors = Partial<Record<"message", string>>;

const COMMENTS_PER_PAGE = 2;

const seedComments = [
    {
        name: "Rico Trimmer",
        email: "rico@example.com",
        message:
            "These tips are so helpful. I have always struggled with meal prep, but after trying the advice here, the week felt calmer and more organized.",
        createdAt: "4 days ago",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80",
    },
    {
        name: "Lina Kale",
        email: "lina@example.com",
        message:
            "I love the one-base approach. It saved me so much time while still letting me enjoy different flavors every day.",
        createdAt: "10 days ago",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80",
    },
    {
        name: "Marco Bean",
        email: "marco@example.com",
        message:
            "The details around planning before shopping are exactly what our small team needed. Clear, practical, and easy to repeat.",
        createdAt: "2 weeks ago",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80",
    },
    {
        name: "Ava Nguyen",
        email: "ava@example.com",
        message:
            "The article made the process feel less intimidating. I tried one idea this weekend and it already changed how I plan lunches.",
        createdAt: "3 weeks ago",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80",
    },
    {
        name: "Sam Curry",
        email: "sam@example.com",
        message:
            "Really useful structure. I would love to see more examples for busy weeknights and small kitchens.",
        createdAt: "1 month ago",
        avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=128&q=80",
    },
    {
        name: "Nora Leaf",
        email: "nora@example.com",
        message: "The tone is warm and practical. I saved this for my next menu planning session.",
        createdAt: "1 month ago",
        avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=128&q=80",
    },
];

const getInitials = (name: string) =>
    name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const getSeedOffset = (slug: string) =>
    slug.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % seedComments.length;

function getSeedComments(slug: string): BlogDetailComment[] {
    const offset = getSeedOffset(slug);
    return [...seedComments.slice(offset), ...seedComments.slice(0, offset)].map((comment, index) => ({
        ...comment,
        id: `${slug}-comment-${index}`,
    }));
}

function formatCommentDate(value?: string | null) {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function mapApiCommentToView(comment: BlogComment): BlogDetailComment {
    return {
        id: comment.id,
        name: comment.name,
        email: comment.email,
        message: comment.message,
        createdAt: formatCommentDate(comment.createdAt),
    };
}

export function BlogDetailComments({ blogId, blogSlug, liveCommentsCount, onCommentCreated }: BlogDetailCommentsProps) {
    const isMockMode = BLOG_DATA_SOURCE === "mock";
    const pathname = usePathname();
    const { isAuthenticated, user, loginWithKeycloak } = useAuthStore();
    const seededComments = useMemo(() => getSeedComments(blogSlug), [blogSlug]);
    const [comments, setComments] = useState<BlogDetailComment[]>(isMockMode ? seededComments : []);
    const [page, setPage] = useState(1);
    const [refreshCommentsKey, setRefreshCommentsKey] = useState(0);
    const [totalPages, setTotalPages] = useState(Math.max(1, Math.ceil(seededComments.length / COMMENTS_PER_PAGE)));
    const [totalElements, setTotalElements] = useState(isMockMode ? seededComments.length : 0);
    const [showListLoading, setShowListLoading] = useState(!isMockMode);
    const [hasLoadedApiComments, setHasLoadedApiComments] = useState(isMockMode);
    const [submitting, setSubmitting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [form, setForm] = useState<CommentFormState>({
        message: "",
        notify: false,
    });
    const [errors, setErrors] = useState<CommentFormErrors>({});
    const [success, setSuccess] = useState<string | null>(null);
    const requestIdRef = useRef(0);
    const loadingDelayRef = useRef<number | null>(null);
    const hasLoadedApiCommentsRef = useRef(isMockMode);

    useEffect(() => {
        hasLoadedApiCommentsRef.current = hasLoadedApiComments;
    }, [hasLoadedApiComments]);

    useEffect(() => {
        return () => {
            if (loadingDelayRef.current) {
                window.clearTimeout(loadingDelayRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setPage(1);
        setErrors({});
        setSuccess(null);
        setLoadError(null);
        hasLoadedApiCommentsRef.current = isMockMode;
        setHasLoadedApiComments(isMockMode);
        setShowListLoading(!isMockMode);
    }, [blogId, blogSlug, isMockMode]);

    useEffect(() => {
        if (!isMockMode) return;
        setComments(seededComments);
        setTotalElements(seededComments.length);
        setTotalPages(Math.max(1, Math.ceil(seededComments.length / COMMENTS_PER_PAGE)));
        setHasLoadedApiComments(true);
        setShowListLoading(false);
    }, [isMockMode, seededComments]);

    const loadComments = useCallback(
        async (options?: { signal?: AbortSignal }) => {
            const requestId = requestIdRef.current + 1;
            requestIdRef.current = requestId;
            const hadLoadedComments = hasLoadedApiCommentsRef.current;
            if (loadingDelayRef.current) {
                window.clearTimeout(loadingDelayRef.current);
            }
            if (!hadLoadedComments) {
                setShowListLoading(true);
            } else {
                loadingDelayRef.current = window.setTimeout(() => {
                    if (requestIdRef.current === requestId) {
                        setShowListLoading(true);
                    }
                }, 150);
            }
            setLoadError(null);
            try {
                const response = await blogApi.getBlogComments(blogId, {
                    page,
                    size: COMMENTS_PER_PAGE,
                    sort: "createdAt,desc",
                });
                if (options?.signal?.aborted || requestIdRef.current !== requestId) return;
                setComments((response.content ?? []).map(mapApiCommentToView));
                setTotalPages(Math.max(1, response.totalPages || 1));
                setTotalElements(response.totalElements ?? 0);
                setHasLoadedApiComments(true);
            } catch (error) {
                if (options?.signal?.aborted || requestIdRef.current !== requestId) return;
                console.error("Failed to load blog comments:", error);
                if (!hadLoadedComments) {
                    setComments([]);
                    setTotalPages(1);
                    setTotalElements(0);
                }
                setLoadError("Unable to load comments right now.");
                setHasLoadedApiComments(true);
            } finally {
                if (!options?.signal?.aborted && requestIdRef.current === requestId) {
                    if (loadingDelayRef.current) {
                        window.clearTimeout(loadingDelayRef.current);
                        loadingDelayRef.current = null;
                    }
                    setShowListLoading(false);
                }
            }
        },
        [blogId, page],
    );

    useEffect(() => {
        if (isMockMode) return;

        const controller = new AbortController();
        loadComments({ signal: controller.signal });
        return () => {
            controller.abort();
        };
    }, [isMockMode, loadComments, refreshCommentsKey]);

    useEffect(() => {
        if (isMockMode || typeof liveCommentsCount !== "number") return;
        if (liveCommentsCount <= totalElements) return;

        if (page !== 1) {
            setPage(1);
            return;
        }
        setRefreshCommentsKey((current) => current + 1);
    }, [isMockMode, liveCommentsCount, page, totalElements]);

    const visibleComments = isMockMode
        ? comments.slice((page - 1) * COMMENTS_PER_PAGE, page * COMMENTS_PER_PAGE)
        : comments;
    const displayName = user?.username || user?.email || "your account";

    const handleSignIn = async () => {
        await loginWithKeycloak({ redirectPath: pathname });
    };

    const updateForm = (key: keyof CommentFormState, value: string | boolean) => {
        setForm((current) => ({ ...current, [key]: value }));
        if (key === "message") {
            setErrors((current) => {
                const nextErrors = { ...current };
                delete nextErrors[key];
                return nextErrors;
            });
        }
        setSuccess(null);
        setLoadError(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextErrors: CommentFormErrors = {};
        if (!form.message.trim()) nextErrors.message = "Please enter your message.";

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            setSuccess(null);
            return;
        }

        if (!isAuthenticated) {
            setLoadError("Please sign in before posting a comment.");
            return;
        }

        if (!isMockMode) {
            setSubmitting(true);
            try {
                const createdComment = await blogApi.createBlogComment(blogId, {
                    message: form.message.trim(),
                    notify: form.notify,
                });
                const nextTotalElements = totalElements + 1;
                setForm({ message: "", notify: false });
                setErrors({});
                setSuccess("Your comment was posted.");
                setLoadError(null);
                setTotalElements(nextTotalElements);
                setTotalPages(Math.max(1, Math.ceil(nextTotalElements / COMMENTS_PER_PAGE)));
                onCommentCreated?.(nextTotalElements);
                if (page === 1) {
                    setComments((current) => [mapApiCommentToView(createdComment), ...current].slice(0, COMMENTS_PER_PAGE));
                    setRefreshCommentsKey((current) => current + 1);
                } else {
                    setPage(1);
                }
            } catch (error: unknown) {
                console.error("Failed to create blog comment:", error);
                const response = (error as { response?: { status?: number; data?: { message?: string } } })?.response;
                const msg = response?.data?.message;
                setSuccess(null);
                if (response?.status === 401) {
                    setLoadError("Your sign-in session expired. Please sign in again before posting a comment.");
                } else if (response?.status === 403) {
                    setLoadError("Your account is not allowed to post comments.");
                } else {
                    setLoadError(msg ?? "Unable to post your comment. Please try again.");
                }
            } finally {
                setSubmitting(false);
            }
            return;
        }

        const nextComments = [
            {
                id: `${blogSlug}-local-${Date.now()}`,
                name: user?.username ?? "Preview User",
                email: user?.email ?? null,
                message: form.message.trim(),
                createdAt: "Just now",
            },
            ...comments,
        ];
        setComments(nextComments);
        setForm({ message: "", notify: false });
        setPage(1);
        setErrors({});
        setSuccess("Your comment was added to this preview.");
        setTotalElements(nextComments.length);
        setTotalPages(Math.max(1, Math.ceil(nextComments.length / COMMENTS_PER_PAGE)));
    };

    return (
        <section className="border-t border-gray-200 pt-12">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="flex items-center gap-2 text-sm font-bold uppercase text-brand-orange">
                        <span className="h-2 w-2 rounded-full bg-brand-orange" />
                        Comments
                    </p>
                    <p className="mt-3 text-2xl font-black uppercase text-brand-orange">{totalElements} Comments</p>
                </div>
                <BlogListPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    buttonClassName="cursor-pointer"
                />
            </div>

            <div className="relative min-h-[210px]">
                {showListLoading && !hasLoadedApiComments ? (
                    <BlogCommentListSkeleton />
                ) : loadError && comments.length === 0 ? (
                    <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">
                        {loadError}
                    </div>
                ) : visibleComments.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-gray-600">
                        No comments yet. Be the first to share a thought.
                    </div>
                ) : (
                    <div className={showListLoading ? "space-y-6 opacity-60 transition-opacity" : "space-y-6 transition-opacity"}>
                        {visibleComments.map((comment) => (
                            <article key={comment.id} className="border-b border-gray-200 pb-6">
                                <div className="flex gap-4">
                                    {comment.avatarUrl ? (
                                        <Image
                                            src={comment.avatarUrl}
                                            alt={comment.name}
                                            width={40}
                                            height={40}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-brand-orange">
                                            {getInitials(comment.name)}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <h3 className="font-bold text-gray-950">{comment.name}</h3>
                                            <p className="text-sm text-gray-500">{comment.createdAt}</p>
                                        </div>
                                        <p className="mt-3 leading-7 text-gray-700">{comment.message}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
                {showListLoading && hasLoadedApiComments && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
                        <div className="rounded-lg border border-orange-100 bg-white/90 px-4 py-2 text-sm font-semibold text-brand-orange shadow-sm backdrop-blur">
                            Loading comments...
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 rounded-lg bg-orange-50 p-6 md:p-8">
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-brand-orange">Share Your Thoughts</h3>
                    <p className="mt-3 max-w-2xl leading-7 text-gray-600">
                        Have a tip that works for you? Sign in and share it with the FoodEats community below.
                    </p>
                </div>

                {!isAuthenticated ? (
                    <div className="rounded-lg border border-brand-orange/10 bg-white p-5">
                        <p className="font-bold text-gray-950">Sign in to join the discussion.</p>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Comments are tied to a real FoodEats account so readers know who shared each thought.
                        </p>
                        <button
                            type="button"
                            onClick={handleSignIn}
                            className="mt-4 inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-brand-orange px-6 text-sm font-bold text-white transition hover:bg-brand-orange/90"
                        >
                            Sign in to comment
                        </button>
                    </div>
                ) : (
                    <div className="rounded-lg border border-brand-orange/10 bg-white px-4 py-3 text-sm text-gray-600">
                        Commenting as <span className="font-bold text-brand-orange">{displayName}</span>
                    </div>
                )}

                <label className="mt-5 block text-sm font-semibold text-gray-800">
                    Message
                    <textarea
                        value={form.message}
                        onChange={(event) => updateForm("message", event.target.value)}
                        placeholder={isAuthenticated ? "Type your message here..." : "Sign in to write a comment"}
                        rows={5}
                        disabled={!isAuthenticated}
                        aria-invalid={!!errors.message}
                        className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                            errors.message
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                : "border-brand-orange/30 focus:border-brand-orange focus:ring-brand-orange/20"
                        }`}
                    />
                    {errors.message && <span className="mt-2 block text-sm font-semibold text-red-600">{errors.message}</span>}
                </label>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={form.notify}
                            onChange={(event) => updateForm("notify", event.target.checked)}
                            disabled={!isAuthenticated}
                            className="h-4 w-4 cursor-pointer rounded border-brand-orange/30 text-brand-orange focus:ring-brand-orange disabled:cursor-not-allowed"
                        />
                        Notify me of follow-up comments via email.
                    </label>
                    <button
                        type="submit"
                        disabled={submitting || !isAuthenticated}
                        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-brand-orange px-8 text-sm font-bold uppercase text-white transition hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Sending..." : "Send Message"}
                    </button>
                </div>

                {success && <p className="mt-4 text-sm font-semibold text-green-900">{success}</p>}
                {loadError && comments.length > 0 && <p className="mt-4 text-sm font-semibold text-red-700">{loadError}</p>}
            </form>
        </section>
    );
}

function BlogCommentListSkeleton() {
    return (
        <div className="space-y-6" aria-label="Loading comments">
            {Array.from({ length: COMMENTS_PER_PAGE }).map((_, index) => (
                <article key={index} className="border-b border-gray-200 pb-6">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-orange-100" />
                        <div className="min-w-0 flex-1">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                                <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                                <div className="h-4 w-10/12 animate-pulse rounded bg-gray-100" />
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
