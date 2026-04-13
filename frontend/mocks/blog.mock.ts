import type { BlogViewFilters, BlogViewModel } from "@/types/blogView.type";

const MOCK_AUTHOR_ID = "00000000-0000-0000-0000-000000000101";

const authors = {
    editorial: {
        id: MOCK_AUTHOR_ID,
        name: "Linh Tran",
        role: "FoodEats Editor",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
    },
    chef: {
        id: "00000000-0000-0000-0000-000000000102",
        name: "Minh Pham",
        role: "Kitchen Notes",
        avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=80",
    },
    ops: {
        id: "00000000-0000-0000-0000-000000000103",
        name: "An Nguyen",
        role: "Restaurant Ops",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
    },
};

export const mockBlogPosts: BlogViewModel[] = [
    {
        id: "mock-01",
        authorId: authors.editorial.id,
        title: "A Saigon Breakfast Route for Slow Mornings",
        slug: "saigon-breakfast-route-slow-mornings",
        excerpt: "A gentle breakfast walk through broth, coffee, and counters that wake up before the city gets loud.",
        content: `Start with a small bowl, a warm counter, and a table close enough to hear the city waking up.

## The Route

Begin with a light noodle bowl and fresh herbs. Then walk to the next block before coffee, keeping the route slow enough to notice what every kitchen is preparing for the morning rush.

## What to Order

- A broth-forward bowl with clean herbs
- A small plate that travels from grill to table
- Iced coffee served after the first stop

## Why It Works

The best breakfast route is not built around speed. It is built around texture, broth, and the quiet confidence of kitchens that repeat the same rhythm every day.`,
        coverImageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-11T08:30:00+07:00",
        createdAt: "2026-04-11T08:00:00+07:00",
        updatedAt: "2026-04-11T08:30:00+07:00",
        author: authors.editorial,
        category: "City Guides",
        tags: ["breakfast", "saigon", "coffee"],
        readTime: 4,
        views: 2480,
        likes: 186,
        commentsCount: 18,
        featured: true,
        dataSource: "mock",
    },
    {
        id: "mock-02",
        authorId: authors.chef.id,
        title: "How to Read a Menu Before the Rush",
        slug: "how-to-read-menu-before-rush",
        excerpt: "A good menu tells you how the kitchen wants to move before the lunch crowd arrives.",
        content: `A good menu tells you how the kitchen wants to move.

## What to Notice

Short sections usually mean tighter prep. Seasonal notes point to dishes that change often, while repeated sauces or garnishes can reveal the house style.

## The Quiet Signal

Before lunch gets loud, scan for the dish that looks simple but specific. That is often where the restaurant has the most confidence.

## Service Tip

Ask one direct question: what should be eaten today, not what sells the most.`,
        coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-10T10:15:00+07:00",
        createdAt: "2026-04-10T09:40:00+07:00",
        updatedAt: "2026-04-10T10:15:00+07:00",
        author: authors.chef,
        category: "Menu Strategy",
        tags: ["menus", "service", "restaurants"],
        readTime: 3,
        views: 1790,
        likes: 132,
        commentsCount: 11,
        featured: true,
        dataSource: "mock",
    },
    {
        id: "mock-03",
        authorId: authors.ops.id,
        title: "The Quiet Work Behind a Better Delivery Plate",
        slug: "quiet-work-behind-better-delivery-plate",
        excerpt: "Delivery food has to survive time, steam, and movement without losing the main idea of the dish.",
        content: `Delivery food has to survive time, steam, and movement.

## Better Travel Notes

- Keep crisp elements separate
- Use sauces that can be added at the table
- Choose packaging that vents without drying the dish

## The Goal

The goal is not to recreate the dining room. The goal is to let the dish arrive with its main idea still intact.`,
        coverImageUrl: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-09T14:00:00+07:00",
        createdAt: "2026-04-09T13:20:00+07:00",
        updatedAt: "2026-04-09T14:00:00+07:00",
        author: authors.ops,
        category: "Delivery",
        tags: ["delivery", "packaging", "operations"],
        readTime: 4,
        views: 3120,
        likes: 210,
        commentsCount: 24,
        featured: false,
        dataSource: "mock",
    },
    {
        id: "mock-04",
        authorId: authors.editorial.id,
        title: "Market Notes for a Cleaner Lunch Menu",
        slug: "market-notes-cleaner-lunch-menu",
        excerpt: "A lunch menu improves when it stops trying to carry the whole day and commits to a few sharp choices.",
        content: `A lunch menu improves when it stops trying to carry the whole day.

## Keep the Center Clear

Choose one anchor, one bright side, and one comfort dish. Then let the rest support those decisions.

## Freshness Without Noise

Fresh herbs, a sharp pickle, or a clean broth can make the menu feel lighter without making it feel small.`,
        coverImageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-08T11:45:00+07:00",
        createdAt: "2026-04-08T11:10:00+07:00",
        updatedAt: "2026-04-08T11:45:00+07:00",
        author: authors.editorial,
        category: "Menu Strategy",
        tags: ["lunch", "markets", "seasonal"],
        readTime: 3,
        views: 1488,
        likes: 94,
        commentsCount: 9,
        featured: false,
        dataSource: "mock",
    },
    {
        id: "mock-05",
        authorId: authors.chef.id,
        title: "A Small Guide to Better Table Photos",
        slug: "small-guide-better-table-photos",
        excerpt: "Food photos do not need to be loud to be useful. They need light, timing, and an honest table.",
        content: `Food photos do not need to be loud to be useful.

## Try This

- Move the plate closer to natural light
- Leave one honest imperfection in the frame
- Shoot the dish before the garnish fades

## Table Energy

The strongest image usually feels like someone is about to sit down, not like the table has been frozen for inspection.`,
        coverImageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-07T16:25:00+07:00",
        createdAt: "2026-04-07T15:55:00+07:00",
        updatedAt: "2026-04-07T16:25:00+07:00",
        author: authors.chef,
        category: "Photography",
        tags: ["photos", "branding", "content"],
        readTime: 5,
        views: 2254,
        likes: 176,
        commentsCount: 15,
        featured: false,
        dataSource: "mock",
    },
    {
        id: "mock-06",
        authorId: authors.ops.id,
        title: "When a Restaurant Should Simplify Specials",
        slug: "when-restaurant-should-simplify-specials",
        excerpt: "Specials are strongest when they create focus instead of adding more noise to service.",
        content: `Specials are strongest when they create focus instead of noise.

## Useful Signals

- Staff can explain the dish in one sentence
- Prep does not interrupt the core menu
- The dish has a clear reason to exist today

## When to Wait

If a special needs too much explanation, it may be better as an experiment in the kitchen before it becomes a promise to guests.`,
        coverImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-06T09:05:00+07:00",
        createdAt: "2026-04-06T08:45:00+07:00",
        updatedAt: "2026-04-06T09:05:00+07:00",
        author: authors.ops,
        category: "Operations",
        tags: ["specials", "ops", "staff"],
        readTime: 4,
        views: 1902,
        likes: 121,
        commentsCount: 13,
        featured: false,
        dataSource: "mock",
    },
    {
        id: "mock-07",
        authorId: authors.editorial.id,
        title: "Why the First Sip Matters",
        slug: "why-the-first-sip-matters",
        excerpt: "A bright tea, a clean broth, or a cold house drink can set the pace for the whole meal.",
        content: `The first sip sets the pace for the meal.

## Make It Count

A bright tea, a clean broth, or a cold house drink can tell guests what kind of attention to expect next.

## Small Openings

Small openings matter because they give the rest of the table a tone to follow.`,
        coverImageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-05T13:10:00+07:00",
        createdAt: "2026-04-05T12:50:00+07:00",
        updatedAt: "2026-04-05T13:10:00+07:00",
        author: authors.editorial,
        category: "Service",
        tags: ["drinks", "service", "hospitality"],
        readTime: 2,
        views: 1210,
        likes: 88,
        commentsCount: 7,
        featured: false,
        dataSource: "mock",
    },
    {
        id: "mock-08",
        authorId: authors.ops.id,
        title: "Weekend Prep That Keeps Service Calm",
        slug: "weekend-prep-keeps-service-calm",
        excerpt: "A calmer service usually starts long before the first order and depends on fewer surprises.",
        content: `A calmer service usually starts long before the first order.

## Prep With Intention

- Batch what holds well
- Label what changes quickly
- Give the busiest station fewer surprises

## Protect Attention

Good prep is not only about volume. It is a way of protecting attention when the room starts moving faster.`,
        coverImageUrl: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-04T07:50:00+07:00",
        createdAt: "2026-04-04T07:20:00+07:00",
        updatedAt: "2026-04-04T07:50:00+07:00",
        author: authors.ops,
        category: "Operations",
        tags: ["prep", "service", "kitchen"],
        readTime: 4,
        views: 2760,
        likes: 202,
        commentsCount: 20,
        featured: false,
        dataSource: "mock",
    },
    {
        id: "mock-09",
        authorId: authors.editorial.id,
        title: "Draft: A Better Late-Night Menu",
        slug: "draft-better-late-night-menu",
        excerpt: "A draft concept for late-night menus built around fewer SKUs and better comfort dishes.",
        content: `Late-night menus work best when they are short, warm, and easy to execute.

## Draft Notes

Keep the dishes simple, but make the sauces specific.`,
        coverImageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
        status: "DRAFT",
        publishedAt: null,
        createdAt: "2026-04-03T20:20:00+07:00",
        updatedAt: "2026-04-03T21:00:00+07:00",
        author: authors.editorial,
        category: "Menu Strategy",
        tags: ["draft", "late-night", "menu"],
        readTime: 2,
        views: 0,
        likes: 0,
        commentsCount: 0,
        featured: false,
        dataSource: "mock",
    },
    {
        id: "mock-10",
        authorId: authors.chef.id,
        title: "Archived: Summer Drink Tests",
        slug: "archived-summer-drink-tests",
        excerpt: "An archived experiment log for summer drink combinations and service timing.",
        content: `This archived note collected early tests for summer drinks.

## What Changed

The final version moved into a newer seasonal planning doc.`,
        coverImageUrl: "https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&w=1600&q=80",
        status: "ARCHIVED",
        publishedAt: "2026-03-28T10:00:00+07:00",
        createdAt: "2026-03-28T09:40:00+07:00",
        updatedAt: "2026-04-02T09:00:00+07:00",
        author: authors.chef,
        category: "Service",
        tags: ["archived", "drinks", "testing"],
        readTime: 2,
        views: 820,
        likes: 41,
        commentsCount: 3,
        featured: false,
        dataSource: "mock",
    },
];

export const mockBlogCategories = Array.from(
    new Set(mockBlogPosts.filter((post) => post.status === "PUBLISHED").map((post) => post.category).filter(Boolean)),
) as string[];

export const mockBlogTags = Array.from(
    new Set(mockBlogPosts.filter((post) => post.status === "PUBLISHED").flatMap((post) => post.tags)),
).slice(0, 12);

const getBlogTime = (post: BlogViewModel) =>
    new Date(post.publishedAt || post.updatedAt || post.createdAt || 0).getTime();

export function filterMockBlogs(filters: BlogViewFilters = {}) {
    const normalizedSearch = filters.search?.trim().toLowerCase() ?? "";
    const category = filters.category;
    const status = filters.status;

    return mockBlogPosts
        .filter((post) => {
            if (status === undefined) return post.status === "PUBLISHED";
            if (status === "") return true;
            return post.status === status;
        })
        .filter((post) => !category || post.category === category)
        .filter((post) => {
            if (!normalizedSearch) return true;
            return [post.title, post.excerpt, post.category, ...post.tags]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(normalizedSearch);
        })
        .sort((a, b) => {
            if (filters.sort === "oldest") return getBlogTime(a) - getBlogTime(b);
            if (filters.sort === "popular") return (b.views ?? 0) - (a.views ?? 0);
            return getBlogTime(b) - getBlogTime(a);
        });
}

export function getMockBlogPage(filters: BlogViewFilters = {}) {
    const page = Math.max(1, filters.page ?? 1);
    const size = filters.size ?? 12;
    const filtered = filterMockBlogs(filters);
    const start = (page - 1) * size;
    const content = filtered.slice(start, start + size);

    return {
        content,
        totalElements: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / size)),
        size,
        number: page - 1,
        empty: content.length === 0,
    };
}

export function getMockBlogBySlug(slug: string) {
    return mockBlogPosts.find((post) => post.slug === slug && post.status === "PUBLISHED") ?? null;
}
