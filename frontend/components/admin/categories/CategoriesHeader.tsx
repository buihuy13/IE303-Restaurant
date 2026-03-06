interface CategoriesHeaderProps {
    total: number;
    onCreate: () => void;
}

export function CategoriesHeader({ total, onCreate }: CategoriesHeaderProps) {
    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Categories</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage food categories in the system</p>
                </div>
                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 transition-colors"
                >
                    <span className="text-lg leading-none">+</span>
                    Add Category
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{total}</p>
            </div>
        </>
    );
}

