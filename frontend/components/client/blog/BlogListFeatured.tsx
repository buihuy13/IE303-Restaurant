import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, TrendingUp } from "lucide-react";
import { getBlogExcerpt } from "@/lib/utils/blogText";
import type { Blog } from "@/types/blog.type";

function formatDate(dateString?: string | null) {
    if (!dateString) return "Unpublished";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

interface BlogListFeaturedProps {
    blog: Blog;
}

export function BlogListFeatured({ blog }: BlogListFeaturedProps) {
    if (!blog.coverImageUrl) return null;
    const excerpt = getBlogExcerpt(blog.content, 220);

    return (
        <div className="mb-12">
            <Link
                href={`/blog/${blog.slug}`}
                className="group relative block h-[460px] w-full cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-100 md:h-[560px]"
            >
                <Image
                    src={blog.coverImageUrl}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-14">
                    <div className="max-w-4xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/15 px-3 py-2 text-sm font-bold text-white backdrop-blur-md">
                            <TrendingUp className="h-4 w-4" />
                            Featured Post
                        </div>
                        <h2 className="line-clamp-2 text-3xl font-bold leading-tight text-white transition-opacity group-hover:opacity-90 md:text-5xl">
                            {blog.title}
                        </h2>
                        <p className="line-clamp-2 max-w-3xl text-lg text-white/90 md:text-xl">{excerpt}</p>
                        <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-white/80 md:text-base">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                <span className="font-medium">{formatDate(blog.publishedAt ?? blog.createdAt)}</span>
                            </div>
                        </div>
                        <div className="pt-4">
                            <span className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-bold text-white transition-all group-hover:translate-x-1 group-hover:bg-brand-orange/90">
                                Read Now
                                <ArrowRight className="h-5 w-5" />
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
