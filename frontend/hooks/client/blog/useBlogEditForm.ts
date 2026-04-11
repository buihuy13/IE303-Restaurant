import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { BlogStatus } from "@/types/blog.type";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function useBlogEditForm(blogId: string | undefined, userId: string | undefined, canManageAll = false) {
    const router = useRouter();
    const editorImageInputRef = useRef<HTMLInputElement>(null);

    const [fetching, setFetching] = useState(true);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [existingCoverImageUrl, setExistingCoverImageUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<BlogStatus>("DRAFT");
    const [loading, setLoading] = useState(false);

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
        [blogId, title, content, status, resolveCoverImageUrl, router],
    );

    return {
        editorImageInputRef,
        fetching,
        title,
        setTitle,
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
