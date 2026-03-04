import { mockAdminCategories } from "@/constants";

export function useAdminCategoriesPage() {
  const categories = mockAdminCategories;
  return { categories };
}
