"use client";

import { useParams } from "next/navigation";
import { BlogDetailPageView } from "@/components/client/blog/BlogDetailPageView";
import { useBlogDetailData } from "@/hooks/client/blog/useBlogDetailData";
import { useBlogDetailShare } from "@/hooks/client/blog/useBlogDetailShare";

export default function BlogDetailPageClient() {
    const params = useParams();
    const slug = params?.slug as string | undefined;

    const { blog, loading } = useBlogDetailData(slug);
    const { handleShare } = useBlogDetailShare(blog);

    return <BlogDetailPageView loading={loading} blog={blog} onShare={handleShare} />;
}
