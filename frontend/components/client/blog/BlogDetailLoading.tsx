export function BlogDetailLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-brand-orange" />
                <p className="mt-6 text-gray-600 text-lg">Loading...</p>
            </div>
        </div>
    );
}
