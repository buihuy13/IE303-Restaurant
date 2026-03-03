"use client";

import Link from "next/link";

import { useBlogListPage } from "@/hooks/blog/useBlogListPage";
import type { MockBlogCategory } from "@/constants";

import { BlogCard } from "./BlogCard";

const CATEGORY_LABELS: { value: MockBlogCategory | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "recipe", label: "Recipe" },
  { value: "review", label: "Review" },
  { value: "tips", label: "Tips" },
  { value: "news", label: "News" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
];

export default function BlogListPageShell() {
  const {
    category,
    setCategory,
    search,
    setSearch,
    blogs,
    featured,
    regular,
  } = useBlogListPage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-10">
      <div className="custom-container">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-black md:text-4xl">
              Food Magazine (mock)
            </h1>
            <p className="mt-2 text-sm text-brand-grey">
              Simple blog list powered by mock data.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md gap-2"
          >
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
            />
          </form>
        </header>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORY_LABELS.map((cat) => (
            <button
              key={cat.value || "all"}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                category === cat.value
                  ? "bg-brand-orange text-brand-white"
                  : "bg-white text-brand-black shadow-sm hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
            <p className="text-base font-semibold text-brand-black">
              No mock posts found.
            </p>
            <p className="mt-2 text-sm text-brand-grey">
              Try changing category or clearing the search.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured */}
            {featured && (
              <Link href={`/blog/${featured.slug}`}>
                <article className="group overflow-hidden rounded-3xl bg-brand-black text-brand-white">
                  <div className="p-6 md:p-8">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-yellow">
                      Featured
                    </p>
                    <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm text-brand-purplelight">
                      {featured.excerpt}
                    </p>
                    <p className="mt-4 text-xs text-brand-yellowlight">
                      {featured.readTime} min read • {featured.category}
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* Grid */}
            {regular.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regular.map((blog) => (
                  <Link key={blog.id} href={`/blog/${blog.slug}`}>
                    <BlogCard blog={blog} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

