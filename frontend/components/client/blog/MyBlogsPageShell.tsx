"use client";

import Link from "next/link";

import { useMyBlogsPage } from "@/hooks/blog/useMyBlogsPage";
import { type MockBlogCategory, type MockBlogStatus } from "@/constants";

const CATEGORY_LABELS: { value: MockBlogCategory | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "recipe", label: "Recipe" },
  { value: "review", label: "Review" },
  { value: "tips", label: "Tips" },
  { value: "news", label: "News" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
];

const STATUS_LABELS: Record<MockBlogStatus, { label: string; color: string }> =
  {
    draft: { label: "Draft", color: "#6B7280" },
    published: { label: "Published", color: "#10B981" },
    archived: { label: "Archived", color: "#F59E0B" },
  };

const BRAND_ORANGE = "#EE4D2D";

export default function MyBlogsPageShell() {
  const {
    blogs,
    total,
    category,
    setCategory,
    status,
    setStatus,
    searchInput,
    setSearchInput,
    applySearch,
  } = useMyBlogsPage();

  const handleCategoryChange = (cat: MockBlogCategory | "") => {
    setCategory(cat);
  };

  const handleStatusChange = (stat: MockBlogStatus | "") => {
    setStatus(stat);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="custom-container">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Link
              href="/blog"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              <span>←</span>
              <span>Back to All Blogs</span>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
                My Articles (mock)
              </h1>
              <p className="text-sm text-gray-600">
                Manage your mock blog posts • {total} post
                {total === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search your articles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applySearch();
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-[#EE4D2D]"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
            <button
              type="button"
              onClick={applySearch}
              className="rounded-lg bg-[#EE4D2D] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Search
            </button>
          </div>

          {/* Category & Status Filters */}
          <div className="flex flex-wrap gap-3">
            <div>
              <span className="mr-2 text-sm font-medium text-gray-700">
                Category:
              </span>
              {CATEGORY_LABELS.map((cat) => (
                <button
                  key={cat.value || "all"}
                  type="button"
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`mr-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    category === cat.value
                      ? "text-white shadow-md"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  style={
                    category === cat.value
                      ? { backgroundColor: BRAND_ORANGE }
                      : undefined
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <button
              type="button"
              onClick={() => handleStatusChange("")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                status === ""
                  ? "bg-gray-700 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            {Object.entries(STATUS_LABELS).map(([value, { label, color }]) => (
              <button
                key={value}
                type="button"
                onClick={() => handleStatusChange(value as MockBlogStatus)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  status === value
                    ? "text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
                style={
                  status === value ? { backgroundColor: color } : undefined
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Blog List */}
        {blogs.length === 0 ? (
          <div className="rounded-xl bg-white py-12 text-center shadow-md">
            <p className="mb-4 text-sm text-gray-600">No articles found</p>
            <Link
              href="/blog/create"
              className="inline-flex items-center gap-2 rounded-lg bg-[#EE4D2D] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <span>＋</span>
              <span>Create Your First Article</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl"
              >
                {/* Thumbnail placeholder */}
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ backgroundColor: BRAND_ORANGE + "20" }}
                  >
                    <span className="text-4xl">🍽️</span>
                  </div>
                  {/* Status badge */}
                  <div className="absolute right-3 top-3">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{
                        backgroundColor:
                          STATUS_LABELS[blog.status].color,
                      }}
                    >
                      {STATUS_LABELS[blog.status].label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <span
                    className="mb-3 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: BRAND_ORANGE }}
                  >
                    {blog.category}
                  </span>
                  <Link href={`/blog/${blog.slug}`}>
                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-opacity hover:opacity-80">
                      {blog.title}
                    </h3>
                  </Link>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                    {blog.excerpt}
                  </p>
                  <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                    <span>👁 {blog.views}</span>
                    <span>♥ {blog.likes}</span>
                    <span>⏱ {blog.readTime} min</span>
                  </div>

                  <div className="mt-auto border-t border-gray-200 pt-3 text-xs text-gray-500">
                    <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

