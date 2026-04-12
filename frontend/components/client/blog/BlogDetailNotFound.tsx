import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BlogDetailNotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <p className="text-gray-600 mb-4 text-lg">Post not found</p>
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-brand-orange hover:underline font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to list
                </Link>
            </div>
        </div>
    );
}
