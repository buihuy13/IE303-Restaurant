"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogEditForm } from "@/hooks/client/blog/useBlogEditForm";
import { useEditorToolbarImageOverride } from "@/hooks/client/blog/useEditorToolbarImageOverride";
import { BlogEditPageView } from "@/components/client/blog/BlogEditPageView";

export default function BlogEditPageClient() {
    const params = useParams();
    const blogId = params?.id as string | undefined;
    const { user, isAuthenticated, loginWithKeycloak } = useAuthStore();
    const form = useBlogEditForm(blogId, user?.id);

    useEditorToolbarImageOverride(form.editorImageInputRef, form.content);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            void loginWithKeycloak({
                redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/blog",
            });
        }
    }, [isAuthenticated, user, loginWithKeycloak]);

    if (!isAuthenticated || !user) return null;

    return (
        <BlogEditPageView form={form} />
    );
}
