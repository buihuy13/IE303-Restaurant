"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogCreateForm } from "@/hooks/client/blog/useBlogCreateForm";
import { useEditorToolbarImageOverride } from "@/hooks/client/blog/useEditorToolbarImageOverride";
import { BlogCreatePageView } from "@/components/client/blog/BlogCreatePageView";

export default function BlogCreatePageClient() {
    const { user, isAuthenticated, loginWithKeycloak } = useAuthStore();
    const form = useBlogCreateForm(
        user?.id,
        user?.username ?? undefined,
        typeof user?.avatar === "string" ? user.avatar : undefined,
    );

    useEditorToolbarImageOverride(form.editorImageInputRef, form.content);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            void loginWithKeycloak({
                redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/blog/create",
            });
        }
    }, [isAuthenticated, user, loginWithKeycloak]);

    if (!isAuthenticated || !user) return null;

    return <BlogCreatePageView form={form} />;
}

