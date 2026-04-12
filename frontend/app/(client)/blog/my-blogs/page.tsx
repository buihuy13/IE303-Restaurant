import MyBlogsPageClient from "@/components/client/blog/MyBlogsPageClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function MyBlogsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-white">
                    <div className="custom-container py-10">
                        <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                            <Loader2 className="w-5 h-5 animate-spin text-brand-orange" />
                            <span className="text-sm font-semibold text-gray-800">Loading your blogs...</span>
                        </div>
                    </div>
                </div>
            }
        >
            <MyBlogsPageClient />
        </Suspense>
    );
}
