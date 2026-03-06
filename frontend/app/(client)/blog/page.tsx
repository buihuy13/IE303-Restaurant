import BlogPageClient from "@/components/client/blog/BlogPageClient";
import type { Blog, BlogCategory } from "@/types/blog.type";

// Temporary mocked blogs while API is not available
const MOCK_BLOGS: Blog[] = [
    {
        _id: "mock-1",
        title: "Welcome to FoodEats Blog",
        slug: "welcome-to-foodeats-blog",
        content: "This is a mocked blog post. Replace it when the real API is ready.",
        excerpt: "Introductory mocked blog post for the FoodEats platform.",
        author: {
            userId: "mock-user-1",
            name: "FoodEats Team",
        },
        featuredImage: {
            url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
            alt: "Delicious food on a table",
        },
        images: [],
        category: "news",
        tags: ["mock", "news"],
        status: "published",
        readTime: 3,
        views: 0,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        seo: {
            metaTitle: "FoodEats Blog (Mock)",
            metaDescription: "Mocked blog content while API is under development.",
            keywords: ["foodeats", "blog", "mock"],
        },
    },
];

async function getInitialBlogListData() {
    const page = 1;
    const category: BlogCategory | "" = "";
    const search = "";

    return {
        blogs: MOCK_BLOGS,
        totalPages: 1,
        page,
        category,
        search,
    };
}

export default async function BlogPage() {
    const initialData = await getInitialBlogListData();

    return <BlogPageClient initialData={initialData} />;
}
