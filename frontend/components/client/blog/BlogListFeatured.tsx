import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Eye, TrendingUp } from "lucide-react";
import { BLOG_CATEGORIES } from "@/lib/constants/blog";
import type { Blog } from "@/types/blog.type";

function formatDate(dateString: string) {
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
    const imgUrl = blog.featuredImage?.url;
    if (!imgUrl) return null;

    const categoryLabel = BLOG_CATEGORIES.find((c) => c.value === blog.category)?.label ?? "Other";

    return (
        <div className="mb-12">
            <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
                <Link href={`/blog/${blog.slug}`}>
                    <Image
                        src={imgUrl}
                        alt={blog.featuredImage?.alt || blog.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
                        <div className="max-w-4xl space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-full border border-white/30">
                                <TrendingUp className="w-4 h-4" />
                                Featured Post
                            </div>
                            <div className="inline-block rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white shadow-lg">
                                {categoryLabel}
                            </div>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight line-clamp-2 group-hover:opacity-90 transition-opacity">
                                {blog.title}
                            </h2>
                            {blog.excerpt && (
                                <p className="text-white/90 text-lg md:text-xl line-clamp-2 max-w-3xl">
                                    {blog.excerpt}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm md:text-base pt-2">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    <span className="font-medium">{blog.views} views</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">{blog.readTime} min read</span>
                                </div>
                                {blog.publishedAt && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        <span className="font-medium">{formatDate(blog.publishedAt)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4">
                                <div className="inline-flex transform items-center gap-2 rounded-xl bg-brand-orange px-8 py-4 font-bold text-white shadow-xl transition-all hover:translate-x-2 hover:bg-brand-orange/90">
                                    Read Now
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
