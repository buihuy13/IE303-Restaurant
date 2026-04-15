import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { BlogEditorialTemplate, BlogStatus } from "@/types/blog.type";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const parseTagsInput = (value: string) =>
    Array.from(
        new Set(
            value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        ),
    ).slice(0, 8);

export function useBlogEditForm(blogId: string | undefined, userId: string | undefined, canManageAll = false) {
    const router = useRouter();
    const editorImageInputRef = useRef<HTMLInputElement>(null);

    const [fetching, setFetching] = useState(true);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [category, setCategory] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [featured, setFeatured] = useState(false);
    const [editorialTemplates, setEditorialTemplates] = useState<BlogEditorialTemplate[]>([]);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState("");
    const [templateKey, setTemplateKey] = useState<string | null>(null);
    const [templateVersion, setTemplateVersion] = useState<string | null>(null);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [existingCoverImageUrl, setExistingCoverImageUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<BlogStatus>("DRAFT");
    const [loading, setLoading] = useState(false);

    const fetchEditorialTemplates = useCallback(async () => {
        try {
            const templates = await blogApi.getEditorialTemplates();
            setEditorialTemplates(templates);
            setSelectedTemplateKey((current) => current || templates[0]?.key || "");
        } catch (error) {
            console.error("Failed to load editorial templates:", error);
        }
    }, []);

    useEffect(() => {
        fetchEditorialTemplates();
    }, [fetchEditorialTemplates]);

    const validateImage = (file: File) => {
        if (file.size > MAX_IMAGE_SIZE) {
            toast.error("Image size must be less than 5MB");
            return false;
        }
        return true;
    };

    const fetchBlogData = useCallback(async () => {
        if (!blogId || !userId) return;
        setFetching(true);
        try {
            const blog = await blogApi.getBlogById(blogId);
            if (!canManageAll && blog.authorId !== userId) {
                toast.error("You don't have permission to edit this blog");
                router.push("/blog/my-blogs");
                return;
            }
            setTitle(blog.title);
            setContent(blog.content);
            setExcerpt(blog.excerpt ?? "");
            setCategory(blog.category ?? "");
            setTagsInput((blog.tags ?? []).join(", "));
            setFeatured(Boolean(blog.featured));
            setTemplateKey(blog.templateKey ?? null);
            setTemplateVersion(blog.templateVersion ?? null);
            setSelectedTemplateKey(blog.templateKey ?? "");
            setStatus(blog.status);
            setExistingCoverImageUrl(blog.coverImageUrl ?? null);
        } catch (error: unknown) {
            console.error("Failed to fetch blog:", error);
            const msg =
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast.error(msg ?? "Failed to load blog");
            router.push("/blog/my-blogs");
        } finally {
            setFetching(false);
        }
    }, [blogId, userId, canManageAll, router]);

    useEffect(() => {
        if (blogId && userId) fetchBlogData();
    }, [blogId, userId, fetchBlogData]);

    const handleCoverImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !validateImage(file)) return;
        setCoverImage(file);
        setExistingCoverImageUrl(null);
        const reader = new FileReader();
        reader.onloadend = () => setCoverImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleRemoveCoverImage = useCallback(() => {
        setCoverImage(null);
        setCoverImagePreview(null);
        setExistingCoverImageUrl(null);
    }, []);

    const handleEditorImageUpload = useCallback(async (file: File): Promise<string> => {
        if (!validateImage(file)) {
            throw new Error("Image too large");
        }
        const response = await blogApi.uploadImages(file);
        const url = response.imageUrls[0];
        if (!url) {
            throw new Error("Upload failed");
        }
        toast.success("Image uploaded successfully");
        return url;
    }, []);

    const insertEditorImage = useCallback((url: string, fileName: string) => {
        const name = fileName.replace(/\.[^/.]+$/, "");
        setContent((prev) => `${prev}\n![${name}](${url})\n`);
    }, []);

    const handleEditorImageSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const url = await handleEditorImageUpload(file);
                insertEditorImage(url, file.name);
            } catch {
                toast.error("Failed to upload image");
            }
            e.target.value = "";
        },
        [handleEditorImageUpload, insertEditorImage],
    );

    const resolveCoverImageUrl = useCallback(async () => {
        if (!coverImage) return existingCoverImageUrl;
        const response = await blogApi.uploadImages(coverImage);
        return response.imageUrls[0] ?? null;
    }, [coverImage, existingCoverImageUrl]);

    const handleInsertTemplate = useCallback(async () => {
        const selectedKey = selectedTemplateKey || editorialTemplates[0]?.key;
        if (!selectedKey) {
            toast.error("No editorial template is available");
            return;
        }
        if (content.trim() && !window.confirm("Replace the current draft with the selected editorial template?")) {
            return;
        }

        setTemplateLoading(true);
        try {
            const normalizedTitle = title.trim() || "Untitled Food Story";
            const normalizedCategory = category.trim() || null;
            const response = await blogApi.renderEditorialTemplate(selectedKey, {
                title: normalizedTitle,
                topic: normalizedTitle,
                language: "en",
                category: normalizedCategory,
            });
            setContent(response.content);
            setTemplateKey(response.templateKey);
            setTemplateVersion(response.templateVersion);
            toast.success("Editorial template inserted");
        } catch (error: unknown) {
            console.error("Failed to render editorial template:", error);
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg ?? "Unable to render editorial template");
        } finally {
            setTemplateLoading(false);
        }
    }, [category, content, editorialTemplates, selectedTemplateKey, title]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!blogId || !title.trim() || !content.trim()) {
                if (!title.trim()) toast.error("Please enter a title");
                else if (!content.trim()) toast.error("Please enter content");
                return;
            }
            setLoading(true);
            try {
                const coverImageUrl = await resolveCoverImageUrl();
                await blogApi.updateBlog(blogId, {
                    title: title.trim(),
                    content: content.trim(),
                    coverImageUrl,
                    status,
                    excerpt: excerpt.trim() || null,
                    category: category.trim() || null,
                    tags: parseTagsInput(tagsInput),
                    featured,
                    templateKey,
                    templateVersion,
                });
                toast.success("Blog updated successfully");
                router.push(status === "PUBLISHED" ? "/blog/my-blogs?status=PUBLISHED" : "/blog/my-blogs");
            } catch (error: unknown) {
                console.error("Failed to update blog:", error);
                const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                toast.error(msg ?? "Failed to update blog. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [blogId, title, content, status, excerpt, category, tagsInput, featured, templateKey, templateVersion, resolveCoverImageUrl, router],
    );

    return {
        editorImageInputRef,
        fetching,
        title,
        setTitle,
        excerpt,
        setExcerpt,
        category,
        setCategory,
        tagsInput,
        setTagsInput,
        featured,
        setFeatured,
        editorialTemplates,
        selectedTemplateKey,
        setSelectedTemplateKey,
        templateLoading,
        handleInsertTemplate,
        content,
        setContent,
        coverImagePreview,
        existingCoverImageUrl,
        status,
        setStatus,
        loading,
        handleCoverImageChange,
        handleRemoveCoverImage,
        handleEditorImageUpload,
        handleEditorImageSelect,
        insertEditorImage,
        handleSubmit,
    };
}
