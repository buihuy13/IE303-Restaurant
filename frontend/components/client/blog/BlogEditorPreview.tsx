"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText } from "lucide-react";

interface BlogEditorPreviewProps {
    title: string;
    content: string;
    coverImageUrl: string | null;
    statusLabel: string;
}

export function BlogEditorPreview({ title, content, coverImageUrl, statusLabel }: BlogEditorPreviewProps) {
    const previewTitle = title.trim() || "Untitled article";
    const previewContent = content.trim() || "Start writing to see the article preview.";

    return (
        <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Live preview</p>
                        <p className="mt-1 text-sm text-gray-500">Frontend only</p>
                    </div>
                    <span className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                        {statusLabel}
                    </span>
                </div>

                <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    {coverImageUrl ? (
                        <Image src={coverImageUrl} alt={previewTitle} fill className="object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            <FileText className="h-10 w-10" />
                        </div>
                    )}
                </div>

                <h2 className="text-2xl font-bold leading-tight tracking-tight text-gray-950">{previewTitle}</h2>
                <div className="markdown-body mt-4 max-h-[440px] overflow-y-auto pr-2 text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewContent}</ReactMarkdown>
                </div>
            </div>
        </aside>
    );
}
