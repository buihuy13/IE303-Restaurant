export function BlogDetailLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-orange" />
                <p className="mt-6 text-lg text-gray-600">Loading...</p>
            </div>
        </div>
    );
}
