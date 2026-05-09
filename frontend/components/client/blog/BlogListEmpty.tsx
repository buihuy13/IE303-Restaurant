interface BlogListEmptyProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function BlogListEmpty({
    title = "No posts found",
    description = "Published posts will appear here.",
    actionLabel,
    onAction,
}: BlogListEmptyProps) {
    return (
        <div className="py-20 text-center">
            <div className="mx-auto max-w-md rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8">
                <p className="text-lg font-semibold text-gray-800">{title}</p>
                <p className="mt-1 text-sm text-gray-600">{description}</p>
                {actionLabel && onAction && (
                    <button
                        type="button"
                        onClick={onAction}
                        className="mt-5 rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
