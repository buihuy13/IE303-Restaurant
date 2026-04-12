export function BlogListEmpty() {
    return (
        <div className="py-20 text-center">
            <div className="mx-auto max-w-md rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8">
                <p className="text-lg font-semibold text-gray-800">No posts found</p>
                <p className="mt-1 text-sm text-gray-600">Published posts will appear here.</p>
            </div>
        </div>
    );
}
