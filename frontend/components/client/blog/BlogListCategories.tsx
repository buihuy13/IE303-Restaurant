import { BLOG_CATEGORIES, BRAND_ORANGE } from "@/lib/constants/blog";
import type { BlogCategory } from "@/types/blog.type";

interface BlogListCategoriesProps {
    category: BlogCategory | "";
    onCategoryChange: (cat: BlogCategory | "") => void;
}

export function BlogListCategories({ category, onCategoryChange }: BlogListCategoriesProps) {
    return (
        <div className="flex flex-wrap gap-3">
            {BLOG_CATEGORIES.map((cat) => (
                <button
                    key={cat.value}
                    type="button"
                    onClick={() => onCategoryChange(cat.value)}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                        category === cat.value
                            ? "text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 shadow-sm"
                    }`}
                    style={category === cat.value ? { backgroundColor: BRAND_ORANGE } : undefined}
                >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label}
                </button>
            ))}
        </div>
    );
}
