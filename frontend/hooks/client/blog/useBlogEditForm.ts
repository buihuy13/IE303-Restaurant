import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { BlogCategory, BlogStatus } from "@/types/blog.type";
import type { BlogUpdateRequest } from "@/types/blog.type";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_CONTENT_IMAGES = 10;

export function useBlogEditForm(blogId: string | undefined, userId: string | undefined) {
    const router = useRouter();
    const editorImageInputRef = useRef<HTMLInputElement>(null);

    const [fetching, setFetching] = useState(true);
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<BlogCategory>("other");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [status, setStatus] = useState<BlogStatus>("draft");
    const [loading, setLoading] = useState(false);

    const fetchBlogData = useCallback(async () => {
        if (!blogId || !userId) return;
        setFetching(true);
        try {
            const response = await blogApi.getBlogById(blogId);
            const blog = response.data;
            if (blog.author.userId !== userId) {
                toast.error("You don't have permission to edit this blog");
                router.push("/blog/my-blogs");
                return;
            }
            setTitle(blog.title);
            setExcerpt(blog.excerpt ?? "");
            setContent(blog.content);
            setCategory(blog.category);
            setTags(blog.tags ?? []);
            setStatus(blog.status);
            if (blog.featuredImage?.url) setExistingImageUrl(blog.featuredImage.url);
            if (blog.images?.length) setExistingImageUrls(blog.images.map((img) => img.url));
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
    }, [blogId, userId, router]);

    useEffect(() => {
        if (blogId && userId) fetchBlogData();
    }, [blogId, userId, fetchBlogData]);

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
        setExistingImageUrl(null);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleRemoveImage = useCallback(() => {
        setFeaturedImage(null);
        setImagePreview(null);
        setExistingImageUrl(null);
    }, []);

    const totalContentImages = existingImageUrls.length + images.length;
    const handleImagesChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            const invalid = files.filter((f) => f.size > MAX_IMAGE_SIZE);
            if (invalid.length > 0) {
                toast.error(`${invalid.length} image(s) exceed 5MB limit`);
                return;
            }
            const remaining = MAX_CONTENT_IMAGES - totalContentImages;
            const toAdd = files.slice(0, remaining);
            if (files.length > remaining) {
                toast.error(`You can only upload up to 10 images total. ${remaining} slots remaining.`);
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
        },
        [totalContentImages],
    );

    const handleRemoveImageAt = useCallback((index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleRemoveExistingImageAt = useCallback((index: number) => {
        setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
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

    const insertEditorImage = useCallback((url: string, fileName: string) => {
        const name = fileName.replace(/\.[^/.]+$/, "");
        const imageMarkdown = `![${name}](${url})`;
        setContent((prev) => `${prev}\n${imageMarkdown}\n`);
    }, []);

    const handleEditorImageSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const url = await handleEditorImageUpload(file);
                insertEditorImage(url, file.name);
            } catch {
                // handled
            }
            e.target.value = "";
        },
        [handleEditorImageUpload, insertEditorImage],
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!blogId || !title.trim() || !content.trim() || !userId) {
                if (!title.trim()) toast.error("Please enter a title");
                else if (!content.trim()) toast.error("Please enter content");
                else if (!userId) toast.error("User information is missing");
                return;
            }
            setLoading(true);
            try {
                const updateData: Record<string, unknown> = {
                    title: title.trim(),
                    content: content.trim(),
                    excerpt: excerpt.trim() || undefined,
                    category,
                    tags: tags.length > 0 ? tags : undefined,
                    status,
                    userId,
                };
                if (featuredImage) updateData.featuredImage = featuredImage;
                if (images.length > 0) updateData.images = images;
                await blogApi.updateBlog(blogId, updateData as BlogUpdateRequest);
                toast.success("Blog updated successfully! 🎉");
                if (status === "published") {
                    router.push("/blog/my-blogs?status=published");
                } else {
                    router.push("/blog/my-blogs");
                }
            } catch (error: unknown) {
                console.error("Failed to update blog:", error);
                const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                toast.error(msg ?? "Failed to update blog. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [blogId, title, content, excerpt, category, tags, status, featuredImage, images, userId, router],
    );

    return {
        editorImageInputRef,
        fetching,
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
        existingImageUrl,
        images,
        imagePreviews,
        existingImageUrls,
        status,
        setStatus,
        loading,
        handleAddTag,
        handleRemoveTag,
        handleImageChange,
        handleRemoveImage,
        handleImagesChange,
        handleRemoveImageAt,
        handleRemoveExistingImageAt,
        handleEditorImageUpload,
        handleEditorImageSelect,
        insertEditorImage,
        handleSubmit,
    };
}
