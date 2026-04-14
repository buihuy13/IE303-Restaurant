"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { getBlogExcerpt } from "@/lib/utils/blogText";
import { cn } from "@/lib/utils";
import type { BlogViewModel } from "@/types/blogView.type";

function formatDate(dateString?: string | null) {
    if (!dateString) return "Unpublished";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

interface BlogHeroCarouselProps {
    blogs: BlogViewModel[];
    activeIndex: number;
    onNext: () => void;
    onPrevious: () => void;
    onGoToSlide: (index: number) => void;
    onPausedChange: (paused: boolean) => void;
}

export function BlogHeroCarousel({
    blogs,
    activeIndex,
    onNext,
    onPrevious,
    onGoToSlide,
    onPausedChange,
}: BlogHeroCarouselProps) {
    const activeBlog = blogs[activeIndex] ?? blogs[0];

    if (!activeBlog?.coverImageUrl) return null;

    return (
        <section
            className="mb-12"
            aria-label="Featured blog stories"
            onMouseEnter={() => onPausedChange(true)}
            onMouseLeave={() => onPausedChange(false)}
            onFocus={() => onPausedChange(true)}
            onBlur={() => onPausedChange(false)}
        >
            <div className="relative h-[460px] overflow-hidden rounded-lg border border-gray-200 bg-gray-100 md:h-[560px]">
                <Image
                    key={activeBlog.coverImageUrl}
                    src={activeBlog.coverImageUrl}
                    alt={activeBlog.title}
                    fill
                    className="object-cover transition-opacity duration-500"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-14">
                    <div className="max-w-4xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/15 px-3 py-2 text-sm font-bold text-white backdrop-blur-md">
                            <TrendingUp className="h-4 w-4" />
                            Featured Story
                        </div>
                        <h2 className="line-clamp-2 text-3xl font-bold leading-tight text-white md:text-5xl">
                            {activeBlog.title}
                        </h2>
                        <p className="line-clamp-2 max-w-3xl text-lg text-white/90 md:text-xl">
                            {activeBlog.excerpt || getBlogExcerpt(activeBlog.content, 220)}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-white/80 md:gap-6 md:text-base">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                <span className="font-medium">{formatDate(activeBlog.publishedAt ?? activeBlog.createdAt)}</span>
                            </div>
                            <span>{activeBlog.readTime} min read</span>
                            {activeBlog.category && <span>{activeBlog.category}</span>}
                            {typeof activeBlog.views === "number" && <span>{activeBlog.views.toLocaleString()} views</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <Link
                                href={`/blog/${activeBlog.slug}`}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-bold text-white transition-all hover:translate-x-1 hover:bg-brand-orange/90"
                            >
                                Read Now
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {blogs.length > 1 && (
                    <>
                        <div className="absolute bottom-5 right-5 flex gap-2">
                            <button
                                type="button"
                                onClick={onPrevious}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/45 md:h-10 md:w-10"
                                aria-label="Previous featured story"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={onNext}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/45 md:h-10 md:w-10"
                                aria-label="Next featured story"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="absolute bottom-4 left-5 flex items-center gap-1.5 md:bottom-5">
                            {blogs.map((blog, index) => (
                                <button
                                    key={blog.id}
                                    type="button"
                                    onClick={() => onGoToSlide(index)}
                                    className={cn(
                                        "h-2 rounded-full transition-all",
                                        index === activeIndex ? "w-6 bg-brand-orange" : "w-2 bg-white/60 hover:bg-white",
                                    )}
                                    aria-label={`Show featured story ${index + 1}`}
                                    aria-current={index === activeIndex}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
