import SearchPageClient from "@/components/client/search/SearchPageClient";
import type { Category } from "@/types";

// Temporary mocked categories while API is not available
const MOCK_CATEGORIES: Category[] = [];

async function getInitialCategories() {
    return MOCK_CATEGORIES;
}

export default async function SearchPage() {
    const initialCategories = await getInitialCategories();

    return <SearchPageClient initialCategories={initialCategories} />;
}
