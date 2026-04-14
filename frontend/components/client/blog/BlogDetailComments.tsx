"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { BlogListPagination } from "@/components/client/blog/BlogListGrid";

interface BlogDetailComment {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
    avatarUrl?: string;
}

interface BlogDetailCommentsProps {
    blogSlug: string;
}

interface CommentFormState {
    name: string;
    email: string;
    message: string;
    notify: boolean;
}

type CommentFormErrors = Partial<Record<"name" | "email" | "message", string>>;

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
        message:
            "The tone is warm and practical. I saved this for my next menu planning session.",
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

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function BlogDetailComments({ blogSlug }: BlogDetailCommentsProps) {
    const seededComments = useMemo(() => getSeedComments(blogSlug), [blogSlug]);
    const [comments, setComments] = useState<BlogDetailComment[]>(seededComments);
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<CommentFormState>({
        name: "",
        email: "",
        message: "",
        notify: false,
    });
    const [errors, setErrors] = useState<CommentFormErrors>({});
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        setComments(seededComments);
        setPage(1);
        setErrors({});
        setSuccess(null);
    }, [seededComments]);

    const totalPages = Math.max(1, Math.ceil(comments.length / COMMENTS_PER_PAGE));
    const visibleComments = comments.slice((page - 1) * COMMENTS_PER_PAGE, page * COMMENTS_PER_PAGE);

    const updateForm = (key: keyof CommentFormState, value: string | boolean) => {
        setForm((current) => ({ ...current, [key]: value }));
        if (key === "name" || key === "email" || key === "message") {
            setErrors((current) => {
                const nextErrors = { ...current };
                delete nextErrors[key];
                return nextErrors;
            });
        }
        setSuccess(null);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextErrors: CommentFormErrors = {};
        if (!form.name.trim()) nextErrors.name = "Please enter your name.";
        if (!form.email.trim()) nextErrors.email = "Please enter your email.";
        else if (!isValidEmail(form.email.trim())) nextErrors.email = "Please enter a valid email address.";
        if (!form.message.trim()) nextErrors.message = "Please enter your message.";

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            setSuccess(null);
            return;
        }

        setComments((current) => [
            {
                id: `${blogSlug}-local-${Date.now()}`,
                name: form.name.trim(),
                email: form.email.trim(),
                message: form.message.trim(),
                createdAt: "Just now",
            },
            ...current,
        ]);
        setForm({ name: "", email: "", message: "", notify: false });
        setPage(1);
        setErrors({});
        setSuccess("Your comment was added to this preview.");
    };

    return (
        <section className="border-t border-gray-200 pt-12">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="flex items-center gap-2 text-sm font-bold uppercase text-brand-green">
                        <span className="h-2 w-2 rounded-full bg-brand-orange" />
                        Comments
                    </p>
                    <p className="mt-3 text-2xl font-black uppercase text-brand-green">{comments.length} Comments</p>
                </div>
                <BlogListPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    buttonClassName="cursor-pointer"
                />
            </div>

            <div className="space-y-6">
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
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-900">
                                    {getInitials(comment.name)}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <h3 className="font-bold text-gray-950">{comment.name}</h3>
                                    <p className="text-sm text-gray-500">{comment.createdAt}</p>
                                </div>
                                <p className="mt-3 leading-7 text-gray-700">{comment.message}</p>
                                <button
                                    type="button"
                                    className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-brand-orange"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Reply
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 rounded-lg bg-green-50 p-6 md:p-8">
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-brand-green">Share Your Thoughts</h3>
                    <p className="mt-3 max-w-2xl leading-7 text-gray-600">
                        Have a tip that works for you? Add it here while community comments are being prepared.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-gray-800">
                        Name
                        <input
                            value={form.name}
                            onChange={(event) => updateForm("name", event.target.value)}
                            placeholder="Your full name"
                            aria-invalid={!!errors.name}
                            className={`mt-2 h-11 w-full rounded-lg border bg-white px-4 text-sm outline-none transition focus:ring-2 ${
                                errors.name
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-green-900/30 focus:border-brand-orange focus:ring-brand-orange/20"
                            }`}
                        />
                        {errors.name && <span className="mt-2 block text-sm font-semibold text-red-600">{errors.name}</span>}
                    </label>
                    <label className="block text-sm font-semibold text-gray-800">
                        Email
                        <input
                            value={form.email}
                            onChange={(event) => updateForm("email", event.target.value)}
                            placeholder="Your email address"
                            aria-invalid={!!errors.email}
                            className={`mt-2 h-11 w-full rounded-lg border bg-white px-4 text-sm outline-none transition focus:ring-2 ${
                                errors.email
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-green-900/30 focus:border-brand-orange focus:ring-brand-orange/20"
                            }`}
                        />
                        {errors.email && <span className="mt-2 block text-sm font-semibold text-red-600">{errors.email}</span>}
                    </label>
                </div>

                <label className="mt-5 block text-sm font-semibold text-gray-800">
                    Message
                    <textarea
                        value={form.message}
                        onChange={(event) => updateForm("message", event.target.value)}
                        placeholder="Type your message here..."
                        rows={5}
                        aria-invalid={!!errors.message}
                        className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                            errors.message
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                : "border-green-900/30 focus:border-brand-orange focus:ring-brand-orange/20"
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
                            className="h-4 w-4 rounded border-green-900/30 text-brand-orange focus:ring-brand-orange"
                        />
                        Notify me of follow-up comments via email.
                    </label>
                    <button
                        type="submit"
                        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-brand-orange px-8 text-sm font-bold uppercase text-white transition hover:bg-brand-orange/90"
                    >
                        Send Message
                    </button>
                </div>

                {success && <p className="mt-4 text-sm font-semibold text-green-900">{success}</p>}
            </form>
        </section>
    );
}
