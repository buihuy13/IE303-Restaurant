"use client";

import { useQuery } from "@tanstack/react-query";

import { getProducts } from "@/services";

export const useProductsQuery = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
