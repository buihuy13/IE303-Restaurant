import { mockProducts } from "@/constants";
import type { Product } from "@/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getProducts = async (): Promise<Product[]> => {
  await delay(1500);
  return mockProducts;
};
