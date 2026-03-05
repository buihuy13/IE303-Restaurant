"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { MDEditorProps } from "@uiw/react-md-editor";
import { ArrowLeft, Image as ImageIcon, Loader2, X } from "lucide-react";
import "@uiw/react-md-editor/markdown-editor.css";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogEditForm } from "@/hooks/client/blog/useBlogEditForm";
import { useEditorToolbarImageOverride } from "@/hooks/client/blog/useEditorToolbarImageOverride";
import { BLOG_CATEGORIES_FORM, BRAND_ORANGE } from "@/lib/constants/blog";
import type { BlogCategory, BlogStatus } from "@/types/blog.type";

const MDEditor = dynamic<MDEditorProps>(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    { ssr: false },
);

export default function BlogEditPageClient() {
    const router = useRouter();
    const params = useParams();
    const blogId = params?.id as string | undefined;
    const { user, isAuthenticated } = useAuthStore();
    const form = useBlogEditForm(blogId, user?.id);

    useEditorToolbarImageOverride(form.editorImageInputRef, form.content);

    useEffect(() => {
        if (!isAuthenticated || !user) router.push("/login");
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || !user) return null;

    if (form.fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
                        style={{ borderBottomColor: BRAND_ORANGE }}
                    />
                    <p className="mt-4 text-gray-600">Loading blog...</p>
                </div>
            </div>
        );
    }

    const featuredPreview = form.imagePreview || form.existingImageUrl;
    const totalContentImages = form.existingImageUrls.length + form.images.length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="custom-container max-w-4xl">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/blog/my-blogs" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
                        <p className="text-gray-600 mt-1">Update your blog post</p>
                    </div>
                </div>

                <form onSubmit={form.handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
                    <div>
                        <label htmlFor="edit-title" className="block text-sm font-semibold text-gray-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-title"
                            type="text"
                            value={form.title}
                            onChange={(e) => form.setTitle(e.target.value)}
                            placeholder="Enter article title..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                            maxLength={200}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">{form.title.length}/200 characters</p>
                    </div>

                    <div>
                        <label htmlFor="edit-excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
                            Excerpt
                        </label>
                        <textarea
                            id="edit-excerpt"
                            value={form.excerpt}
                            onChange={(e) => form.setExcerpt(e.target.value)}
                            placeholder="Brief description (optional)..."
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">{form.excerpt.length}/500 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
                        {featuredPreview ? (
                            <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                                <Image src={featuredPreview} alt="Preview" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={form.handleRemoveImage}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    aria-label="Remove image"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                </div>
                                <input type="file" accept="image/*" onChange={form.handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Content Images <span className="text-xs text-gray-500 font-normal">(Optional, up to 10)</span>
                        </label>
                        {(form.existingImageUrls.length > 0 || form.imagePreviews.length > 0) && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                                {form.existingImageUrls.map((url, index) => (
                                    <div
                                        key={`existing-${index}`}
                                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-300"
                                    >
                                        <Image src={url} alt={`Existing ${index + 1}`} fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => form.handleRemoveExistingImageAt(index)}
                                            className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            aria-label={`Remove existing image ${index + 1}`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {form.imagePreviews.map((preview, index) => (
                                    <div
                                        key={`new-${index}`}
                                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-300"
                                    >
                                        <Image src={preview} alt={`New ${index + 1}`} fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => form.handleRemoveImageAt(index)}
                                            className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            aria-label={`Remove new image ${index + 1}`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {totalContentImages < 10 && (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                    <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="mb-1 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> multiple images
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 5MB each ({totalContentImages}/10)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={form.handleImagesChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-category" className="block text-sm font-semibold text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                id="edit-category"
                                value={form.category}
                                onChange={(e) => form.setCategory(e.target.value as BlogCategory)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                                aria-label="Category"
                            >
                                {BLOG_CATEGORIES_FORM.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="edit-status" className="block text-sm font-semibold text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                id="edit-status"
                                value={form.status}
                                onChange={(e) => form.setStatus(e.target.value as BlogStatus)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                                aria-label="Publish status"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="edit-tags" className="block text-sm font-semibold text-gray-700 mb-2">
                            Tags
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                id="edit-tags"
                                type="text"
                                value={form.tagInput}
                                onChange={(e) => form.setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        form.handleAddTag();
                                    }
                                }}
                                placeholder="Add tags (press Enter)..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                            />
                            <button
                                type="button"
                                onClick={form.handleAddTag}
                                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: BRAND_ORANGE }}
                            >
                                Add
                            </button>
                        </div>
                        {form.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {form.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => form.handleRemoveTag(tag)}
                                            className="hover:text-red-500"
                                            aria-label={`Remove tag ${tag}`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="edit-content" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                    const files = Array.from(event.dataTransfer.files);
                                    const imageFile = files.find((f) => f.type.startsWith("image/"));
                                    if (imageFile) {
                                        event.preventDefault();
                                        form.handleEditorImageUpload(imageFile)
                                            .then((url) => form.insertEditorImage(url, imageFile.name))
                                            .catch(() => {});
                                    }
                                }}
                                onPaste={(event: React.ClipboardEvent<HTMLDivElement>) => {
                                    const items = Array.from(event.clipboardData.items);
                                    const imageItem = items.find((item) => item.type.startsWith("image/"));
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
                        <p className="text-xs text-gray-500 mt-2">
                            Write your article in Markdown. Use <code className="bg-gray-100 px-1 rounded">#</code> for
                            headings, <code className="bg-gray-100 px-1 rounded">**bold**</code> for bold. Click the
                            image button to upload images.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={form.loading}
                            className="flex-1 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ backgroundColor: BRAND_ORANGE }}
                        >
                            {form.loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                `Update ${form.status === "published" ? "and Publish" : "as Draft"}`
                            )}
                        </button>
                        <Link
                            href="/blog/my-blogs"
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
