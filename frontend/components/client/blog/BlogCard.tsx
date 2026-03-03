import type { MockBlog } from "@/constants";

type BlogCardProps = {
  blog: MockBlog;
};

export function BlogCard({ blog }: BlogCardProps) {
  const date = new Date(blog.publishedAt);
  const formattedDate = Number.isNaN(date.getTime())
    ? blog.publishedAt
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
        {blog.category}
      </p>
      <h3 className="mt-2 line-clamp-2 text-lg font-bold text-brand-black">
        {blog.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-brand-grey">
        {blog.excerpt}
      </p>
      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-brand-grey">
        <span>{formattedDate}</span>
        <span>{blog.readTime} min read</span>
      </div>
    </article>
  );
}

