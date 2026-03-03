"use client";

import Link from "next/link";
import toast from "react-hot-toast";

import { useBlogCreatePage } from "@/hooks/blog/useBlogCreatePage";
import { type MockBlogCategory } from "@/constants";

const CATEGORIES: { value: MockBlogCategory; label: string }[] = [
  { value: "recipe", label: "Recipe" },
  { value: "review", label: "Review" },
  { value: "tips", label: "Tips" },
  { value: "news", label: "News" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
];

export default function BlogCreatePageShell() {
  const {
    title,
    setTitle,
    excerpt,
    setExcerpt,
    content,
    setContent,
    category,
    setCategory,
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    reset,
  } = useBlogCreatePage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }
    toast.success("This is a mock create blog action.");
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="custom-container max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/blog"
            className="rounded-full p-2 transition-colors hover:bg-gray-200"
          >
            <span>←</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Write New Article (mock)
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Share your food story with the community.
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-white p-6 shadow-md md:p-8"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EE4D2D]"
              maxLength={200}
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label
              htmlFor="excerpt"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description of your article (optional)..."
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EE4D2D]"
            />
          </div>

          {/* Category & Tags */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as MockBlogCategory)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EE4D2D]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tags"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Tags
              </label>
              <div className="mb-2 flex gap-2">
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tags (press Enter)..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-lg bg-[#EE4D2D] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article in Markdown or plain text..."
              rows={10}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EE4D2D]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 border-t border-gray-200 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[#EE4D2D] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create (mock)
            </button>
            <Link
              href="/blog"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

