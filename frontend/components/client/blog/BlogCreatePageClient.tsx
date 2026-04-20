"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogCreateForm } from "@/hooks/client/blog/useBlogCreateForm";
import { useEditorToolbarImageOverride } from "@/hooks/client/blog/useEditorToolbarImageOverride";
import { BlogCreatePageView } from "@/components/client/blog/BlogCreatePageView";

export default function BlogCreatePageClient() {
    const router = useRouter();
    const { user, isAuthenticated, authRole, loginWithKeycloak } = useAuthStore();
    const canManageBlogs = authRole === "ADMIN" || authRole === "MERCHANT";
    const form = useBlogCreateForm();

    useEditorToolbarImageOverride(form.editorImageInputRef, form.content);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            void loginWithKeycloak({
                redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/blog/create",
            });
            return;
        }
        if (!canManageBlogs) {
            router.push("/blog");
        }
    }, [isAuthenticated, user, canManageBlogs, loginWithKeycloak, router]);

    if (!isAuthenticated || !user || !canManageBlogs) return null;

    return <BlogCreatePageView form={form} />;
}
