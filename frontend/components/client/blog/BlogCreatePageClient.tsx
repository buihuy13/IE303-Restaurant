"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogCreateForm } from "@/hooks/client/blog/useBlogCreateForm";
import { useEditorToolbarImageOverride } from "@/hooks/client/blog/useEditorToolbarImageOverride";
import { BlogCreatePageView } from "@/components/client/blog/BlogCreatePageView";

export default function BlogCreatePageClient() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const form = useBlogCreateForm(
        user?.id,
        user?.username ?? undefined,
        typeof user?.avatar === "string" ? user.avatar : undefined,
    );

    useEditorToolbarImageOverride(form.editorImageInputRef, form.content);

    useEffect(() => {
        if (!isAuthenticated || !user) router.push("/login");
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || !user) return null;

    return <BlogCreatePageView form={form} />;
}

