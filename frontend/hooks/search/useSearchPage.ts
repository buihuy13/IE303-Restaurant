import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { mockProducts } from "@/constants";

type SortValue = "relevance" | "price-asc" | "price-desc";

export function useSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [sort, setSort] = useState<SortValue>("relevance");
  const [priceRange, setPriceRange] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    if (query) {
      const q = query.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (priceRange) {
      if (priceRange.endsWith("+")) {
        const min = parseInt(priceRange.replace("+", "").split("-")[0], 10);
        products = products.filter((p) => p.price >= min);
      } else {
        const [minStr, maxStr] = priceRange.split("-");
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        products = products.filter(
          (p) => p.price >= min && p.price <= max,
        );
      }
    }

    if (sort === "price-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      products.sort((a, b) => b.price - a.price);
    }

    return products;
  }, [query, priceRange, sort]);

  return {
    query,
    sort,
    setSort,
    priceRange,
    setPriceRange,
    filteredProducts,
  };
}

