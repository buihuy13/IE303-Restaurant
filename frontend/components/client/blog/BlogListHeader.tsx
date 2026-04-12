import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BlogListHeaderProps {
    canManageBlogs: boolean;
}

export function BlogListHeader({ canManageBlogs }: BlogListHeaderProps) {
    return (
        <div className="mb-10 border-b border-gray-200 pb-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">FoodEats Journal</p>
                    <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-gray-950 md:text-6xl">
                        Ideas for better menus, calmer service, and memorable tables.
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                        Read field notes and practical stories from the FoodEats kitchen network.
                    </p>
                </div>
                {canManageBlogs && (
                    <div className="flex flex-wrap gap-3">
                        <Button asChild variant="brandOutline" className="rounded-lg border-brand-orange/50 bg-white px-5 py-2.5">
                            <Link href="/blog/my-blogs">
                                <FileText className="w-4 h-4" />
                                My Posts
                            </Link>
                        </Button>
                        <Button asChild variant="brand" className="rounded-lg px-5 py-2.5">
                            <Link href="/blog/create">
                                <Plus className="w-4 h-4" />
                                Write Post
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
