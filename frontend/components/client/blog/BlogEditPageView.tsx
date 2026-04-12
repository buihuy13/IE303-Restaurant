"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { MDEditorProps } from "@uiw/react-md-editor";
import { ArrowLeft, Image as ImageIcon, Loader2, X } from "lucide-react";
import "@uiw/react-md-editor/markdown-editor.css";
import type { BlogStatus } from "@/types/blog.type";

type BlogEditForm = {
    fetching: boolean;
    title: string;
    setTitle: (value: string) => void;
    coverImagePreview: string | null;
    existingCoverImageUrl: string | null;
    handleRemoveCoverImage: () => void;
    handleCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    status: BlogStatus;
    setStatus: (value: BlogStatus) => void;
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

export interface BlogEditPageViewProps {
    form: BlogEditForm;
}

export function BlogEditPageView({ form }: BlogEditPageViewProps) {
    if (form.fetching) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-brand-orange" />
                    <p className="mt-4 text-gray-600">Loading blog...</p>
                </div>
            </div>
        );
    }

    const coverPreview = form.coverImagePreview || form.existingCoverImageUrl;

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="custom-container max-w-4xl">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/blog/my-blogs" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
                        <p className="mt-1 text-gray-600">Update title, content, cover and status</p>
                    </div>
                </div>

                <form
                    onSubmit={form.handleSubmit}
                    className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8"
                >
                    <div>
                        <label htmlFor="edit-title" className="mb-2 block text-sm font-semibold text-gray-700">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-title"
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
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Cover Image</label>
                        {coverPreview ? (
                            <div className="relative h-64 w-full overflow-hidden rounded-lg border border-gray-300">
                                <Image src={coverPreview} alt="Preview" fill className="object-cover" />
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
                        <label htmlFor="edit-status" className="mb-2 block text-sm font-semibold text-gray-700">
                            Status
                        </label>
                        <select
                            id="edit-status"
                            value={form.status}
                            onChange={(e) => form.setStatus(e.target.value as BlogStatus)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                            aria-label="Publish status"
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="edit-content" className="mb-2 block text-sm font-semibold text-gray-700">
                            Content <span className="text-red-500">*</span>
                        </label>
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
                                    Updating...
                                </>
                            ) : (
                                "Update Article"
                            )}
                        </button>
                        <Link
                            href="/blog/my-blogs"
                            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
