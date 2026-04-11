export function BlogListEmpty() {
    return (
        <div className="py-20 text-center">
            <div className="mx-auto max-w-md rounded-3xl border border-gray-200/90 bg-gradient-to-b from-gray-50 to-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <p className="text-lg font-semibold text-gray-800">No posts found</p>
                <p className="mt-1 text-sm text-gray-600">Published posts will appear here.</p>
            </div>
        </div>
    );
}
