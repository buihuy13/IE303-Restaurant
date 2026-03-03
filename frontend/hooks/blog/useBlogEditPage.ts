import { useEffect, useState } from "react";

import { useBlogDetailPage } from "./useBlogDetailPage";
import { type MockBlogCategory } from "@/constants";

type BlogEditState = {
  title: string;
  excerpt: string;
  content: string;
  category: MockBlogCategory;
  tags: string[];
};

export function useBlogEditPage(slug: string) {
  const { blog, isNotFound } = useBlogDetailPage(slug);

  const [initialized, setInitialized] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] =
    useState<MockBlogCategory>("other");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (blog && !initialized) {
      setTitle(blog.title);
      setExcerpt(blog.excerpt);
      setContent(blog.content);
      setCategory(blog.category);
      setTags([]);
      setInitialized(true);
    }
  }, [blog, initialized]);

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    setTags((prev) => [...prev, value]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const state: BlogEditState = {
    title,
    excerpt,
    content,
    category,
    tags,
  };

  return {
    blog,
    isNotFound,
    initialized,
    state,
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
  };
}

