import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BlogListHeaderProps {
    canManageBlogs: boolean;
}

export function BlogListHeader({ canManageBlogs }: BlogListHeaderProps) {
    return (
        <header className="mb-10 border-b border-gray-200 pb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-5xl space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
                        FoodEats Magazine
                    </p>
                    <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-gray-950 md:text-6xl">
                        Fresh stories from kitchens, counters, and city tables.
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                        Guides, service notes, and restaurant ideas for people who plan meals with curiosity.
                    </p>
                </div>

                {canManageBlogs && (
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:pt-2">
                        <Button
                            asChild
                            variant="brandOutline"
                            className="w-full rounded-lg border-brand-orange/50 bg-white px-5 py-2.5 sm:w-auto"
                        >
                            <Link href="/blog/my-blogs">
                                <FileText className="h-4 w-4" />
                                Manage Posts
                            </Link>
                        </Button>
                        <Button asChild variant="brand" className="w-full rounded-lg px-5 py-2.5 sm:w-auto">
                            <Link href="/blog/create">
                                <Plus className="h-4 w-4" />
                                Write Post
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
}
