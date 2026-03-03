import { useMemo, useState } from "react";

import { mockBlogs, type MockBlogCategory } from "@/constants";

export function useBlogListPage() {
  const [category, setCategory] = useState<MockBlogCategory | "">("");
  const [search, setSearch] = useState("");

  const blogs = useMemo(() => {
    let items = [...mockBlogs];

    if (category) {
      items = items.filter((b) => b.category === category);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q),
      );
    }

    items.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime(),
    );

    return items;
  }, [category, search]);

  const featured = blogs[0] ?? null;
  const regular = featured ? blogs.slice(1) : blogs;

  return {
    category,
    setCategory,
    search,
    setSearch,
    blogs,
    featured,
    regular,
  };
}

