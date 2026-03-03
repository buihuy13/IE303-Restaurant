import BlogDetailPageShell from "@/components/client/blog/BlogDetailPageShell";

type PageProps = {
  params: { slug: string };
};

export default function BlogDetailPage({ params }: PageProps) {
  return <BlogDetailPageShell slug={params.slug} />;
}

