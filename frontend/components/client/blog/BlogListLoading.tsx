export function BlogListLoading() {
    return (
        <div className="py-20 text-center">
            <div className="mx-auto max-w-md rounded-3xl border border-gray-200/90 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-orange" />
                <p className="mt-6 text-lg text-gray-600">Loading...</p>
            </div>
        </div>
    );
}
