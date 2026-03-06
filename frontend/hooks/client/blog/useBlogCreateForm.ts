import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { BlogCategory, BlogStatus } from "@/types/blog.type";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_CONTENT_IMAGES = 10;

export function useBlogCreateForm(
    userId: string | undefined,
    username: string | undefined,
    avatar: string | undefined,
) {
    const router = useRouter();
    const editorImageInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<BlogCategory>("other");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [status, setStatus] = useState<BlogStatus>("draft");
    const [loading, setLoading] = useState(false);

    const handleAddTag = useCallback(() => {
        const t = tagInput.trim();
        if (t && !tags.includes(t)) {
            setTags((prev) => [...prev, t]);
            setTagInput("");
        }
    }, [tagInput, tags]);

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    }, []);

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_IMAGE_SIZE) {
            toast.error("Image size must be less than 5MB");
            return;
        }
        setFeaturedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleRemoveImage = useCallback(() => {
        setFeaturedImage(null);
        setImagePreview(null);
    }, []);

    const handleImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const invalid = files.filter((f) => f.size > MAX_IMAGE_SIZE);
        if (invalid.length > 0) {
            toast.error(`${invalid.length} image(s) exceed 5MB limit`);
            return;
        }
        const remaining = MAX_CONTENT_IMAGES - images.length;
        const toAdd = files.slice(0, remaining);
        if (files.length > remaining) {
            toast.error(`You can only upload up to 10 images. ${remaining} slots remaining.`);
        }
        setImages((prev) => [...prev, ...toAdd]);
        toAdd.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    }, [images.length]);

    const handleRemoveImageAt = useCallback((index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleEditorImageUpload = useCallback(async (file: File): Promise<string> => {
        if (file.size > MAX_IMAGE_SIZE) {
            toast.error("Image size must be less than 5MB");
            throw new Error("Image too large");
        }
        const response = await blogApi.uploadEditorImage(file);
        if (response.success && response.data?.url) {
            toast.success("Image uploaded successfully!");
            return response.data.url;
        }
        throw new Error("Upload failed");
    }, []);

    const insertEditorImage = useCallback(
        (url: string, fileName: string) => {
            const name = fileName.replace(/\.[^/.]+$/, "");
            const imageMarkdown = `![${name}](${url})`;
            setContent((prev) => `${prev}\n${imageMarkdown}\n`);
        },
        [],
    );

    const handleEditorImageSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const url = await handleEditorImageUpload(file);
                insertEditorImage(url, file.name);
            } catch {
                // Error already handled
            }
            e.target.value = "";
        },
        [handleEditorImageUpload, insertEditorImage],
    );

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
            if (!userId || !username) {
                toast.error("User information is missing");
                return;
            }
            setLoading(true);
            try {
                await blogApi.createBlog({
                    title: title.trim(),
                    content: content.trim(),
                    excerpt: excerpt.trim() || undefined,
                    category,
                    tags: tags.length > 0 ? tags : undefined,
                    status,
                    featuredImage: featuredImage || undefined,
                    images: images.length > 0 ? images : undefined,
                    author: { userId, name: username, avatar: typeof avatar === "string" ? avatar : undefined },
                });
                toast.success("Blog created successfully! 🎉");
                if (status === "published") {
                    router.push("/blog/my-blogs?status=published");
                } else {
                    router.push("/blog/my-blogs");
                }
            } catch (error: unknown) {
                console.error("Failed to create blog:", error);
                const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                toast.error(msg ?? "Failed to create blog. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [
            title,
            content,
            excerpt,
            category,
            tags,
            status,
            featuredImage,
            images,
            userId,
            username,
            avatar,
            router,
        ],
    );

    return {
        editorImageInputRef,
        title,
        setTitle,
        excerpt,
        setExcerpt,
        content,
        setContent,
        category,
        setCategory,
        tags,
        tagInput,
        setTagInput,
        featuredImage,
        imagePreview,
        images,
        imagePreviews,
        status,
        setStatus,
        loading,
        handleAddTag,
        handleRemoveTag,
        handleImageChange,
        handleRemoveImage,
        handleImagesChange,
        handleRemoveImageAt,
        handleEditorImageUpload,
        handleEditorImageSelect,
        insertEditorImage,
        handleSubmit,
    };
}
