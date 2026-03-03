"use client";

import Link from "next/link";

import { useBlogDetailPage } from "@/hooks/blog/useBlogDetailPage";

type BlogDetailPageShellProps = {
  slug: string;
};

export default function BlogDetailPageShell({
  slug,
}: BlogDetailPageShellProps) {
  const { blog, isNotFound } = useBlogDetailPage(slug);

  if (isNotFound || !blog) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-10">
        <div className="custom-container text-center">
          <p className="text-base font-semibold text-brand-black">
            Post not found
          </p>
          <p className="mt-2 text-sm text-brand-grey">
            This is a mock blog detail page. Make sure you use one of the mock
            slugs from `mockBlogs`.
          </p>
          <Link
            href="/blog"
            className="mt-4 inline-flex items-center rounded-full bg-brand-orange px-4 py-2 text-xs font-semibold text-brand-white"
          >
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(blog.publishedAt);
  const formattedDate = Number.isNaN(date.getTime())
    ? blog.publishedAt
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-10">
      <div className="custom-container max-w-3xl">
        <Link
          href="/blog"
          className="text-xs font-semibold text-brand-grey hover:text-brand-orange"
        >
          ← Back to blog
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-brand-black md:text-4xl">
          {blog.title}
        </h1>
        <p className="mt-3 text-sm text-brand-grey">{blog.excerpt}</p>
        <p className="mt-2 text-xs text-brand-grey">
          {formattedDate} • {blog.readTime} min read • {blog.category}
        </p>
        <article className="markdown-content mt-6 whitespace-pre-line text-sm leading-relaxed">
          {blog.content}
        </article>
      </div>
    </div>
  );
}

