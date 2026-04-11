import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BlogListHeaderProps {
    canManageBlogs: boolean;
}

export function BlogListHeader({ canManageBlogs }: BlogListHeaderProps) {
    return (
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-10 rounded-full bg-brand-orange" />
                    <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">Food Magazine</h1>
                </div>
                <p className="max-w-2xl text-base text-gray-600 md:text-lg">
                    Stories, updates and practical notes from the FoodEats team
                </p>
            </div>
            {canManageBlogs && (
                <div className="flex gap-3">
                    <Button asChild variant="brandOutline" className="rounded-xl border-brand-orange/50 bg-white px-5 py-2.5 shadow-sm">
                        <Link href="/blog/my-blogs">
                            <FileText className="w-4 h-4" />
                            My Posts
                        </Link>
                    </Button>
                    <Button asChild variant="brand" className="rounded-xl px-5 py-2.5 shadow-md hover:shadow-lg">
                        <Link href="/blog/create">
                            <Plus className="w-4 h-4" />
                            Write Post
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
