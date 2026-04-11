import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { BlogStatus } from "@/types/blog.type";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function useBlogCreateForm() {
    const router = useRouter();
    const editorImageInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [status, setStatus] = useState<Exclude<BlogStatus, "ARCHIVED">>("DRAFT");
    const [loading, setLoading] = useState(false);

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
        [title, content, status, uploadCoverImage, router],
    );

    return {
        editorImageInputRef,
        title,
        setTitle,
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
