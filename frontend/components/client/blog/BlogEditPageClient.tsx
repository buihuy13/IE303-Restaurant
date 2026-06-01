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
    const { user, isAuthenticated, authRole, loginWithKeycloak } = useAuthStore();
    const canManageBlogs = authRole === "ADMIN" || authRole === "MERCHANT";
    const form = useBlogEditForm(blogId, user?.id, authRole === "ADMIN");

    useEditorToolbarImageOverride(form.editorImageInputRef, form.content);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            void loginWithKeycloak({
                redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/blog",
            });
            return;
        }
        if (!canManageBlogs) {
            router.push("/blog");
        }
    }, [isAuthenticated, user, canManageBlogs, loginWithKeycloak, router]);

    if (!isAuthenticated || !user || !canManageBlogs) return null;

    return <BlogEditPageView form={form} />;
}
