import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { BlogDataSource } from "@/types/blogView.type";

interface BlogListHeaderProps {
    canManageBlogs: boolean;
    totalElements: number;
    dataSource: BlogDataSource;
}

export function BlogListHeader({ canManageBlogs, totalElements, dataSource }: BlogListHeaderProps) {
    return (
        <div className="mb-10 border-b border-gray-200 pb-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">FoodEats Magazine</p>
                        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-gray-950 md:text-6xl">
                            Fresh stories from kitchens, counters, and city tables.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                            Guides, service notes, and restaurant ideas for people who plan meals with curiosity.
                        </p>
                    </div>
                    {canManageBlogs && (
                        <div className="flex flex-wrap gap-3">
                            <Button asChild variant="brandOutline" className="rounded-lg border-brand-orange/50 bg-white px-5 py-2.5">
                                <Link href="/blog/my-blogs">
                                    <FileText className="h-4 w-4" />
                                    My Posts
                                </Link>
                            </Button>
                            <Button asChild variant="brand" className="rounded-lg px-5 py-2.5">
                                <Link href="/blog/create">
                                    <Plus className="h-4 w-4" />
                                    Write Post
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-950">This issue</p>
                    <div className="mt-5 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-3xl font-bold text-brand-orange">{totalElements}</p>
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">Stories</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-950">{dataSource === "mock" ? "Mock" : "API"}</p>
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">Source</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                        Field notes for menu builders, operators, and guests who read before they order.
                    </p>
                </div>
            </div>
        </div>
    );
}
