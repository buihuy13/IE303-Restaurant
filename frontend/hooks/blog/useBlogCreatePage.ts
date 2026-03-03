import { useState } from "react";

import { type MockBlogCategory } from "@/constants";

type BlogCreateState = {
  title: string;
  excerpt: string;
  content: string;
  category: MockBlogCategory;
  tags: string[];
};

export function useBlogCreatePage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] =
    useState<MockBlogCategory>("other");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    setTags((prev) => [...prev, value]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const reset = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategory("other");
    setTags([]);
    setTagInput("");
  };

  const state: BlogCreateState = {
    title,
    excerpt,
    content,
    category,
    tags,
  };

  return {
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
    reset,
  };
}

