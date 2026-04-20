import SearchPageClient from "@/components/client/search/SearchPageClient";
import { fetchPublicCategoriesForSearch } from "@/lib/server/fetchPublicCategories";

export default async function SearchPage() {
    const initialCategories = await fetchPublicCategoriesForSearch();

    return <SearchPageClient initialCategories={initialCategories} />;
}
