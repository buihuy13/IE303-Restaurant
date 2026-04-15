"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { MDEditorProps } from "@uiw/react-md-editor";
import { ArrowLeft, Image as ImageIcon, Loader2, X } from "lucide-react";
import "@uiw/react-md-editor/markdown-editor.css";
import { BLOG_STATUS_LABELS } from "@/lib/constants/blog";
import { BlogEditorPreview } from "@/components/client/blog/BlogEditorPreview";
import { BlogWritingQualityPanel } from "@/components/client/blog/BlogWritingQualityPanel";
import type { BlogEditorialTemplate, BlogStatus } from "@/types/blog.type";

type BlogCreateForm = {
    title: string;
    setTitle: (value: string) => void;
    excerpt: string;
    setExcerpt: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    tagsInput: string;
    setTagsInput: (value: string) => void;
    featured: boolean;
    setFeatured: (value: boolean) => void;
    editorialTemplates: BlogEditorialTemplate[];
    selectedTemplateKey: string;
    setSelectedTemplateKey: (value: string) => void;
    templateLoading: boolean;
    handleInsertTemplate: () => void;
    coverImagePreview: string | null;
    handleRemoveCoverImage: () => void;
    handleCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    status: Exclude<BlogStatus, "ARCHIVED">;
    setStatus: (value: Exclude<BlogStatus, "ARCHIVED">) => void;
    editorImageInputRef: React.RefObject<HTMLInputElement | null>;
    handleEditorImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    content: string;
    setContent: (value: string) => void;
    handleEditorImageUpload: (file: File) => Promise<string>;
    insertEditorImage: (url: string, alt: string) => void;
    loading: boolean;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const MDEditor = dynamic<MDEditorProps>(() => import("@uiw/react-md-editor").then((mod) => mod.default), {
    ssr: false,
});

export interface BlogCreatePageViewProps {
    form: BlogCreateForm;
}

export function BlogCreatePageView({ form }: BlogCreatePageViewProps) {
    return (
        <div className="min-h-screen bg-white py-8">
            <div className="custom-container max-w-7xl">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/blog" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Write New Article</h1>
                        <p className="mt-1 text-gray-600">Publish a clean FoodEats blog post</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <form
                        onSubmit={form.handleSubmit}
                        className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8"
                    >
                        <div>
                            <label htmlFor="title" className="mb-2 block text-sm font-semibold text-gray-700">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={form.title}
                                onChange={(e) => form.setTitle(e.target.value)}
                                placeholder="Enter article title..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                                maxLength={255}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">{form.title.length}/255 characters</p>
                        </div>

                        <div>
                            <label htmlFor="excerpt" className="mb-2 block text-sm font-semibold text-gray-700">
                                Excerpt
                            </label>
                            <textarea
                                id="excerpt"
                                value={form.excerpt}
                                onChange={(e) => form.setExcerpt(e.target.value)}
                                placeholder="Short summary for list cards and detail intro. Leave blank to auto-generate."
                                className="min-h-24 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                                maxLength={240}
                            />
                            <p className="mt-1 text-xs text-gray-500">{form.excerpt.length}/240 characters</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="category" className="mb-2 block text-sm font-semibold text-gray-700">
                                    Category
                                </label>
                                <input
                                    id="category"
                                    type="text"
                                    value={form.category}
                                    onChange={(e) => form.setCategory(e.target.value)}
                                    placeholder="Menu Strategy"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                                    maxLength={120}
                                />
                            </div>
                            <div>
                                <label htmlFor="tags" className="mb-2 block text-sm font-semibold text-gray-700">
                                    Tags
                                </label>
                                <input
                                    id="tags"
                                    type="text"
                                    value={form.tagsInput}
                                    onChange={(e) => form.setTagsInput(e.target.value)}
                                    placeholder="lunch, menu, operations"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                                />
                                <p className="mt-1 text-xs text-gray-500">Separate tags with commas. Max 8 tags.</p>
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-gray-800">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => form.setFeatured(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                            />
                            Mark as featured story
                        </label>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Cover Image</label>
                            {form.coverImagePreview ? (
                                <div className="relative h-64 w-full overflow-hidden rounded-lg border border-gray-300">
                                    <Image src={form.coverImagePreview} alt="Preview" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={form.handleRemoveCoverImage}
                                        className="absolute right-2 top-2 rounded-md bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                                        aria-label="Remove image"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:bg-gray-50">
                                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                        <ImageIcon className="mb-3 h-10 w-10 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> PNG, JPG, WebP or GIF
                                        </p>
                                        <p className="text-xs text-gray-500">Up to 5MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={form.handleCoverImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        <div>
                            <label htmlFor="status" className="mb-2 block text-sm font-semibold text-gray-700">
                                Status
                            </label>
                            <select
                                id="status"
                                value={form.status}
                                onChange={(e) => form.setStatus(e.target.value as Exclude<BlogStatus, "ARCHIVED">)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                                aria-label="Publish status"
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="content" className="mb-2 block text-sm font-semibold text-gray-700">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <div className="mb-4">
                                <BlogWritingQualityPanel
                                    content={form.content}
                                    coverImageUrl={form.coverImagePreview}
                                    templates={form.editorialTemplates}
                                    selectedTemplateKey={form.selectedTemplateKey}
                                    templateLoading={form.templateLoading}
                                    onTemplateChange={form.setSelectedTemplateKey}
                                    onInsertTemplate={form.handleInsertTemplate}
                                />
                            </div>
                            <input
                                ref={form.editorImageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={form.handleEditorImageSelect}
                                className="hidden"
                                aria-label="Upload image for editor"
                            />
                            <div data-color-mode="light">
                                <MDEditor
                                    value={form.content}
                                    onChange={(val) => form.setContent(val ?? "")}
                                    height={500}
                                    preview="edit"
                                    visibleDragbar={false}
                                    onDrop={(event: React.DragEvent<HTMLDivElement>) => {
                                        const imageFile = Array.from(event.dataTransfer.files).find((file) =>
                                            file.type.startsWith("image/"),
                                        );
                                        if (imageFile) {
                                            event.preventDefault();
                                            form.handleEditorImageUpload(imageFile)
                                                .then((url) => form.insertEditorImage(url, imageFile.name))
                                                .catch(() => {});
                                        }
                                    }}
                                    onPaste={(event: React.ClipboardEvent<HTMLDivElement>) => {
                                        const imageItem = Array.from(event.clipboardData.items).find((item) =>
                                            item.type.startsWith("image/"),
                                        );
                                        if (imageItem) {
                                            event.preventDefault();
                                            const file = imageItem.getAsFile();
                                            if (file) {
                                                form.handleEditorImageUpload(file)
                                                    .then((url) => form.insertEditorImage(url, file.name))
                                                    .catch(() => {});
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 border-t border-gray-200 pt-4">
                            <button
                                type="submit"
                                disabled={form.loading}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    `Create ${form.status === "PUBLISHED" ? "and Publish" : "as Draft"}`
                                )}
                            </button>
                            <Link
                                href="/blog"
                                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>

                    <BlogEditorPreview
                        title={form.title}
                        content={form.content}
                        coverImageUrl={form.coverImagePreview}
                        statusLabel={BLOG_STATUS_LABELS[form.status].label}
                    />
                </div>
            </div>
        </div>
    );
}
