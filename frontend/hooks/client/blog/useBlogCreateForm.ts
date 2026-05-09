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

export function useBlogCreateForm() {
    const router = useRouter();
    const editorImageInputRef = useRef<HTMLInputElement>(null);

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
    const [status, setStatus] = useState<Exclude<BlogStatus, "ARCHIVED">>("DRAFT");
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

    const handleCoverImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !validateImage(file)) return;
        setCoverImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setCoverImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleRemoveCoverImage = useCallback(() => {
        setCoverImage(null);
        setCoverImagePreview(null);
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

    const uploadCoverImage = useCallback(async () => {
        if (!coverImage) return null;
        const response = await blogApi.uploadImages(coverImage);
        return response.imageUrls[0] ?? null;
    }, [coverImage]);

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
            if (!title.trim()) {
                toast.error("Please enter a title");
                return;
            }
            if (!content.trim()) {
                toast.error("Please enter content");
                return;
            }
            setLoading(true);
            try {
                const coverImageUrl = await uploadCoverImage();
                await blogApi.createBlog({
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
                toast.success("Blog created successfully");
                router.push(status === "PUBLISHED" ? "/blog/my-blogs?status=PUBLISHED" : "/blog/my-blogs");
            } catch (error: unknown) {
                console.error("Failed to create blog:", error);
                const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                toast.error(msg ?? "Failed to create blog. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [title, content, status, excerpt, category, tagsInput, featured, templateKey, templateVersion, uploadCoverImage, router],
    );

    return {
        editorImageInputRef,
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
