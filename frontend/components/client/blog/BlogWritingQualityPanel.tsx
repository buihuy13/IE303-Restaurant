"use client";

import { CheckCircle2, Circle, FileText, Image as ImageIcon, ListChecks, Timer } from "lucide-react";
import { getBlogWritingStats } from "@/lib/utils/blogWriting";
import type { BlogEditorialTemplate } from "@/types/blog.type";

interface BlogWritingQualityPanelProps {
    content: string;
    coverImageUrl?: string | null;
    templates: BlogEditorialTemplate[];
    selectedTemplateKey: string;
    templateLoading: boolean;
    onTemplateChange: (key: string) => void;
    onInsertTemplate: () => void;
}

export function BlogWritingQualityPanel({
    content,
    coverImageUrl,
    templates,
    selectedTemplateKey,
    templateLoading,
    onTemplateChange,
    onInsertTemplate,
}: BlogWritingQualityPanelProps) {
    const stats = getBlogWritingStats(content, coverImageUrl);
    const selectedTemplate = templates.find((template) => template.key === selectedTemplateKey) ?? templates[0];
    const resolvedSelectedTemplateKey = selectedTemplate?.key ?? "";

    return (
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">Writing quality</p>
                    <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-950">{stats.qualityLabel}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                        Build a richer article with a clear opening, useful sections, and enough detail for readers to
                        finish with one practical takeaway.
                    </p>
                </div>

                <div className="w-full space-y-2 lg:w-72">
                    <label htmlFor="editorial-template" className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Template
                    </label>
                    <select
                        id="editorial-template"
                        value={resolvedSelectedTemplateKey}
                        onChange={(event) => onTemplateChange(event.target.value)}
                        disabled={templates.length === 0 || templateLoading}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {templates.length === 0 ? (
                            <option value="">No templates available</option>
                        ) : (
                            templates.map((template) => (
                                <option key={template.key} value={template.key}>
                                    {template.name}
                                </option>
                            ))
                        )}
                    </select>
                    <button
                        type="button"
                        onClick={onInsertTemplate}
                        disabled={templates.length === 0 || templateLoading}
                        className="inline-flex w-full items-center justify-center rounded-lg border border-brand-orange px-4 py-2 text-sm font-semibold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {templateLoading ? "Rendering..." : "Use selected template"}
                    </button>
                </div>
            </div>

            {selectedTemplate && (
                <div className="mt-5 rounded-md border border-orange-100 bg-white p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-950">{selectedTemplate.name}</p>
                            <p className="mt-1 text-sm leading-6 text-gray-600">{selectedTemplate.description}</p>
                        </div>
                        <span className="mt-1 shrink-0 rounded-md bg-orange-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-orange">
                            v{selectedTemplate.version}
                        </span>
                    </div>
                    {selectedTemplate.qualityRules.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {selectedTemplate.qualityRules.map((rule) => (
                                <span key={rule} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                    {rule}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    <span>Draft strength</span>
                    <span>{stats.qualityScore}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                        className="h-full rounded-full bg-brand-orange transition-all"
                        style={{ width: `${stats.qualityScore}%` }}
                    />
                </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FileText className="h-4 w-4 text-brand-orange" />
                        Words
                    </div>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{stats.wordCount}</p>
                </div>
                <div className="rounded-md border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Timer className="h-4 w-4 text-brand-orange" />
                        Read time
                    </div>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{stats.estimatedReadTime} min</p>
                </div>
                <div className="rounded-md border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <ListChecks className="h-4 w-4 text-brand-orange" />
                        Sections
                    </div>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{stats.headingCount}</p>
                </div>
                <div className="rounded-md border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <ImageIcon className="h-4 w-4 text-brand-orange" />
                        Images
                    </div>
                    <p className="mt-2 text-2xl font-bold text-gray-950">{stats.imageCount}</p>
                </div>
            </div>

            <div className="mt-5 space-y-2">
                {stats.checks.map((check) => (
                    <div key={check.id} className="flex items-center gap-3 text-sm text-gray-700">
                        {check.met ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                            <Circle className="h-4 w-4 shrink-0 text-gray-300" />
                        )}
                        <span className={check.met ? "font-medium text-gray-900" : undefined}>{check.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
