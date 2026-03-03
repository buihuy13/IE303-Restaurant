import { useMemo } from "react";

import { mockProducts, mockRestaurants } from "@/constants";

export function useFoodDetailPage(slug: string) {
  const product = useMemo(
    () =>
      mockProducts.find(
        (p) =>
          p.id.toLowerCase() === slug.toLowerCase() ||
          p.name.toLowerCase().replace(/\s+/g, "-") ===
            slug.toLowerCase(),
      ),
    [slug],
  );

  const restaurant = useMemo(
    () => (mockRestaurants.length > 0 ? mockRestaurants[0] : null),
    [],
  );

  const isNotFound = !product;

  return {
    product,
    restaurant,
    isNotFound,
  };
}

