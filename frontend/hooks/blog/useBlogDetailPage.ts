import { useMemo } from "react";

import { mockBlogs } from "@/constants";

export function useBlogDetailPage(slug: string) {
  const blog = useMemo(
    () =>
      mockBlogs.find(
        (b) =>
          b.slug.toLowerCase() === slug.toLowerCase() ||
          b.id.toLowerCase() === slug.toLowerCase(),
      ),
    [slug],
  );

  const isNotFound = !blog;

  return { blog, isNotFound };
}

