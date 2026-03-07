import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BlogDetailNotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
            <div className="text-center">
                <p className="text-gray-600 mb-4 text-lg">Post not found</p>
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-[#EE4D2D] hover:underline font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to list
                </Link>
            </div>
        </div>
    );
}
