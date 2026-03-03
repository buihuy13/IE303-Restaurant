import { useMemo, useState } from "react";

import {
  mockBlogs,
  type MockBlog,
  type MockBlogCategory,
  type MockBlogStatus,
} from "@/constants";

type StatusFilter = MockBlogStatus | "";

export function useMyBlogsPage() {
  const [category, setCategory] = useState<MockBlogCategory | "">("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const filteredBlogs: MockBlog[] = useMemo(() => {
    let items = [...mockBlogs];

    if (category) {
      items = items.filter((b) => b.category === category);
    }

    if (status) {
      items = items.filter((b) => b.status === status);
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
  }, [category, status, search]);

  const total = filteredBlogs.length;

  const handleApplySearch = () => {
    setSearch(searchInput);
  };

  return {
    blogs: filteredBlogs,
    total,
    category,
    setCategory,
    status,
    setStatus,
    searchInput,
    setSearchInput,
    applySearch: handleApplySearch,
  };
}

