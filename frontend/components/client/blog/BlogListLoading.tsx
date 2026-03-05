import { BRAND_ORANGE } from "@/lib/constants/blog";

export function BlogListLoading() {
    return (
        <div className="text-center py-20">
            <div
                className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#EE4D2D]"
                style={{ borderTopColor: BRAND_ORANGE }}
            />
            <p className="mt-6 text-gray-600 text-lg">Loading...</p>
        </div>
    );
}
