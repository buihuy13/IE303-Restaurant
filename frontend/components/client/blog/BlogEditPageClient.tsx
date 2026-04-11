"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogEditForm } from "@/hooks/client/blog/useBlogEditForm";
import { useEditorToolbarImageOverride } from "@/hooks/client/blog/useEditorToolbarImageOverride";
import { BlogEditPageView } from "@/components/client/blog/BlogEditPageView";

export default function BlogEditPageClient() {
    const router = useRouter();
    const params = useParams();
    const blogId = params?.id as string | undefined;
    const { user, isAuthenticated, authRole } = useAuthStore();
    const canManageBlogs = authRole === "ADMIN" || authRole === "MERCHANT";
    const form = useBlogEditForm(blogId, user?.id, authRole === "ADMIN");

    useEditorToolbarImageOverride(form.editorImageInputRef, form.content);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push("/login");
            return;
        }
        if (!canManageBlogs) {
            router.push("/blog");
        }
    }, [isAuthenticated, user, canManageBlogs, router]);

    if (!isAuthenticated || !user || !canManageBlogs) return null;

    return <BlogEditPageView form={form} />;
}
