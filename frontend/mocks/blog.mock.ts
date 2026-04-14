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
        content: `Start with a small bowl, a warm counter, and a table close enough to hear the city waking up. A slow Saigon breakfast is less about checking famous stops off a list and more about noticing how each kitchen carries the morning: the first ladle of broth, the first basket of herbs, the first glass of coffee sweating beside the curb.

## Start Before the Street Gets Loud

The best route begins early, while the air is still soft and the vendors are setting their rhythm. Choose a noodle shop where the broth smells clean rather than heavy. Sit close enough to the counter to see the cook build each bowl, because that small choreography tells you more than any signboard.

Order something light first: a clear broth, fresh herbs, a squeeze of lime, and a small plate that lets you wake up with the city instead of rushing past it.

## Build the Walk Around Texture

A good breakfast walk needs contrast. After the first bowl, move slowly toward something grilled, crisp, or wrapped. The point is not to eat as much as possible. The point is to let each stop change the pace of the morning.

- Start with broth or rice porridge.
- Add a small grilled or fried plate for texture.
- Save coffee until after the first real bite.

If two stops feel too similar, skip one. Repetition makes the route feel heavier than it needs to be.

## Where Coffee Belongs

Coffee should feel like a pause, not an opening move. By the time the glass arrives, you should already have a little salt, heat, and herb on your palate. That makes the sweetness and bitterness of the drink feel more intentional.

Look for a table where you can watch the next wave of customers arrive. A good breakfast route is also a way to read the neighborhood.

## A Better Way To Try It

Pick three stops within walking distance and give yourself at least ninety minutes. Do not start with the most famous place. Start with the lightest dish, follow the smell of the grill, and end somewhere you would be happy to sit quietly for ten minutes.

## What To Bring Back

Take one note from each stop: the broth that felt clean, the texture that changed the walk, and the table where the morning slowed down. Those notes become more useful than a ranked list because they help you build a route that fits your own appetite next time. Breakfast is personal; the best version is the one you can repeat without turning it into an errand.

If you are writing about the route later, describe the transitions as much as the dishes. The walk, the wait, and the way the neighborhood changes between stops are what make the guide feel lived in rather than copied from a checklist.

## Closing Thought

The best Saigon breakfast routes are not built around speed. They are built around texture, broth, and the quiet confidence of kitchens that have repeated the same rhythm for years.`,
        coverImageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-11T08:30:00+07:00",
        createdAt: "2026-04-11T08:00:00+07:00",
        updatedAt: "2026-04-11T08:30:00+07:00",
        author: authors.editorial,
        category: "City Guides",
        tags: ["breakfast", "saigon", "coffee"],
        readTime: 6,
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
        content: `A good menu tells you how the kitchen wants to move before the room gets loud. If you read it carefully, you can see what the team has prepared for, which dishes they trust, and where the strongest meal is likely to happen.

## What to Notice

Start with the shape of the menu instead of the dish names. Short sections usually mean tighter prep. A seasonal line often points to something the kitchen is actively watching. Repeated sauces, garnishes, or side dishes can reveal the house style, especially when they appear across very different plates.

The most useful clues are rarely loud. They are small patterns that show how the kitchen wants service to flow.

## Find the Confident Dish

Before lunch gets busy, scan for the dish that looks simple but specific. A menu item with a clear protein, one sharp sauce, and a seasonal side often has more confidence than a plate carrying too many ideas.

Good dishes do not need to explain themselves for a paragraph. They should tell you what they are, why they belong on the menu, and what kind of appetite they are meant to answer.

## Service Tip

If you are unsure, do not ask what sells the most. Ask what should be eaten today. That question gives the server permission to think about freshness, timing, prep, and the kitchen's current rhythm.

- "What is best right now?"
- "Which dish changes most often?"
- "What would you order if you had twenty minutes?"

Each question is more useful than asking for the safest option.

## Read the Menu Like a Map

Menus are operational documents as much as they are guest-facing copy. If every dish leans rich, order something acidic on the side. If the vegetables look thoughtful, trust them. If the specials section is too long, look back to the core menu.

## What This Changes

Reading the menu this way gives you a calmer kind of confidence. You can still be surprised, but you are no longer guessing blindly. You are matching your appetite to the kitchen's strongest signals: prep rhythm, seasonal focus, and dishes the team can explain without hesitation. That is usually where the better meal is waiting.

It also helps the restaurant. Guests who order with a little more context tend to ask sharper questions, choose dishes that fit the moment, and leave with a clearer sense of what the kitchen does best.

That clarity is the difference between ordering safely and ordering well.

## Closing Thought

A better menu read does not make dining complicated. It makes the meal calmer. You stop chasing the biggest promise and start choosing the dish the restaurant is already set up to do well.`,
        coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-10T10:15:00+07:00",
        createdAt: "2026-04-10T09:40:00+07:00",
        updatedAt: "2026-04-10T10:15:00+07:00",
        author: authors.chef,
        category: "Menu Strategy",
        tags: ["menus", "service", "restaurants"],
        readTime: 6,
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
        content: `Delivery food has to survive time, steam, and movement. A plate that feels sharp in the dining room can turn dull on the road if the kitchen does not plan for what happens after the handoff. Better delivery is not only a packaging problem. It is a menu design problem, a timing problem, and a guest expectation problem.

## Better Travel Notes

The first rule is to protect contrast. Crisp elements need air. Broths need heat. Herbs need distance from steam. Sauces need a way to arrive without flooding the main ingredient.

- Keep crisp elements separate.
- Use sauces that can be added at the table.
- Choose packaging that vents without drying the dish.
- Avoid garnishes that collapse before the rider arrives.

These details feel small until the customer opens the box.

## Design for the Last Five Minutes

Most delivery decisions should be made around the last five minutes of the journey. That is when steam collects, fried edges soften, and sauce moves into places it was never meant to go. If a dish only works for the first five minutes after plating, it probably needs a delivery version instead of a prettier container.

Restaurants can test this honestly: pack the dish, wait fifteen minutes, carry it around the block, then eat it without fixing it. The result will show what the guest actually receives.

## What Should Change

Some dishes need minor adjustments. Others need to stay off the delivery menu. A noodle bowl might need broth packed separately. A rice plate might need sauce on the side. A salad might need the warm component isolated so the greens still have life.

The best delivery menus are not always the biggest ones. They are the ones that know what can travel with dignity.

## A Better Guest Moment

A clear instruction card can help: pour the sauce, shake the herbs, reheat for two minutes, or eat the crisp topping first. This is not a gimmick. It gives the customer a way to finish the plate correctly.

## What Teams Should Measure

Track which dishes get complaints about sogginess, leaking, missing heat, or confusing assembly. Those signals are more useful than a simple star rating because they point to the exact part of the journey that failed. A delivery plate can often be fixed by changing one detail: a vent, a separator, a sauce cup, or the moment the order is sealed.

Review those notes weekly instead of waiting for a full menu reset. Delivery quality usually improves through small, repeated adjustments, and those adjustments are easier to make while the team still remembers what happened during the rush.

## Closing Thought

The goal is not to recreate the dining room. The goal is to let the dish arrive with its main idea still intact.`,
        coverImageUrl: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-09T14:00:00+07:00",
        createdAt: "2026-04-09T13:20:00+07:00",
        updatedAt: "2026-04-09T14:00:00+07:00",
        author: authors.ops,
        category: "Delivery",
        tags: ["delivery", "packaging", "operations"],
        readTime: 6,
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
        content: `A lunch menu improves when it stops trying to carry the whole day. The strongest midday menus are focused enough to read quickly, flexible enough to serve different appetites, and clean enough that the kitchen can execute them during a rush without losing the details that make the food feel alive.

## Keep the Center Clear

Choose one anchor, one bright side, and one comfort dish. Then let the rest support those decisions. When every item tries to be the signature, the menu becomes noisy. When the center is clear, guests can make decisions faster and the team can explain the meal with more confidence.

The anchor might be a grilled protein, a noodle bowl, or a rice plate that carries the house flavor. The bright side might be pickled vegetables, a herb salad, or a broth that resets the palate. The comfort dish should be steady, not sleepy.

## Use the Market Without Chasing It

Market notes should sharpen the menu, not rewrite it every morning. Fresh herbs, a sharp pickle, or a clean broth can make lunch feel lighter without making it feel small. A seasonal vegetable can appear in two places if it helps prep stay calm.

- One seasonal garnish can refresh a core dish.
- One rotating side can make regulars pay attention.
- One market special is enough if service is already tight.

The goal is freshness with discipline.

## Make the Menu Easy to Staff

A clean lunch menu should be easy to explain in one minute. If the team needs a long briefing for every item, the guest will feel that hesitation at the table. Build descriptions around what matters: main ingredient, flavor direction, and best occasion.

Avoid clever names that hide the food. Clear language helps everyone move faster.

## Practical Notes

If the kitchen is getting buried at noon, reduce the number of custom decisions. Offer two sauces instead of four. Keep one vegetarian plate strong instead of scattering vegetables across weak options. Let the menu do less work, but do that work more clearly.

## What Guests Should Feel

Guests should feel that lunch can be chosen without negotiation. The menu should give them a fast path to something light, something filling, and something familiar. When those choices are clear, regulars come back because they trust the rhythm. New guests relax because the restaurant has already done the editing for them.

That feeling matters on busy weekdays, when people want a meal that respects their time. A clean lunch menu gives them enough variety to feel cared for and enough focus to avoid decision fatigue before they return to the rest of the day.

## Closing Thought

A better lunch menu does not feel smaller. It feels calmer. It gives the guest a clean path to a good decision and gives the kitchen enough room to protect quality.`,
        coverImageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-08T11:45:00+07:00",
        createdAt: "2026-04-08T11:10:00+07:00",
        updatedAt: "2026-04-08T11:45:00+07:00",
        author: authors.editorial,
        category: "Menu Strategy",
        tags: ["lunch", "markets", "seasonal"],
        readTime: 6,
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
        content: `Food photos do not need to be loud to be useful. The best table images make someone feel invited, not interrupted. They show the dish clearly, keep the mood honest, and leave enough life in the frame that the meal still feels like it belongs to a real table.

## Try This

Move the plate closer to natural light before you touch the camera. A window, a shaded patio, or a bright corner usually does more for food than another filter. If the light is too direct, turn the plate until the shine softens and the texture becomes readable.

Then check the edges of the frame. A glass, a folded napkin, or a hand reaching for a spoon can help the photo feel inhabited. Too many props make the table look staged.

## Keep One Honest Imperfection

Perfect food photos often feel distant. Leave one honest imperfection in the frame: a crumb, a spoon mark, steam lifting from one side, or a sauce trail that shows the plate was made by hand. The detail should feel natural, not messy.

This is especially useful for restaurant content because guests are not only buying the dish. They are buying the feeling of sitting down.

## Shoot Before the Dish Fades

Timing matters. Herbs wilt, fried edges soften, ice melts, and sauces settle. If a dish depends on freshness, photograph it quickly and move on. Do not keep adjusting the table until the food loses the reason it looked good in the first place.

- Shoot the hero angle first.
- Take one detail shot for texture.
- Stop when the food still looks alive.

## Practical Notes

For menus and blog posts, aim for clarity over drama. A readable photo helps the guest understand portion, texture, and occasion. If the image is for a story, include a little more table context. If it is for a product card, keep the dish more direct.

## A Simple Shot List

Take three images before moving on: one wide table shot, one clean dish shot, and one close detail that shows texture. This gives the team enough variety for a blog hero, a listing card, and a social crop without forcing the food to sit under the camera too long. The discipline is useful because it protects both the image and the meal.

After the first pass, choose the image that makes the dish easiest to understand. A beautiful but confusing photo may win attention for a second, but a clear photo helps the reader imagine ordering, sharing, or returning for that plate.

## Closing Thought

The strongest table photo usually feels like someone is about to sit down, not like the table has been frozen for inspection.`,
        coverImageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-07T16:25:00+07:00",
        createdAt: "2026-04-07T15:55:00+07:00",
        updatedAt: "2026-04-07T16:25:00+07:00",
        author: authors.chef,
        category: "Photography",
        tags: ["photos", "branding", "content"],
        readTime: 6,
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
        content: `Specials are strongest when they create focus instead of noise. A good special gives the team something timely to talk about and gives guests a reason to pay attention. A weak special adds prep, slows service, and leaves everyone explaining why the dish exists.

## Useful Signals

Start with the staff test. If the team can explain the dish in one sentence, the idea is probably clear. If the explanation needs a long story, the special may not be ready for service.

The second signal is prep. A special should not interrupt the core menu unless it is important enough to justify the disruption. If it steals attention from dishes guests already came for, the tradeoff needs to be deliberate.

## Give the Dish a Reason

The best specials have a reason to exist today. Maybe the market had excellent greens. Maybe the weather changed. Maybe the kitchen is testing a sauce that belongs with one specific protein. The reason does not need to be dramatic, but it should be real.

- A seasonal ingredient is at its best.
- A prep item can be used while it is freshest.
- A regular dish can be seen from a new angle.

Without that reason, a special becomes extra noise.

## When to Simplify

Simplify when the special requires too many stations, too many garnishes, or too much explanation. Simplify when the dining room is already busy. Simplify when the team likes the idea but cannot serve it consistently.

This does not mean killing creativity. It means protecting the guest experience from experiments that are not ready to leave the kitchen.

## A Better Version

Instead of three specials, offer one. Instead of a complicated plate, focus on one strong ingredient and one clear technique. Let the server describe it quickly, then let the dish prove the point.

## How To Learn From It

Treat the special as a small test with a clear question. Are guests interested in the ingredient? Can the station execute it during a rush? Does the dish create repeat orders or only curiosity? The answers help the restaurant decide whether the idea should disappear, return next week, or become part of the core menu later.

Write the question down before service begins. If the team knows what it is trying to learn, the feedback after service becomes more useful than a quick "it sold" or "it did not sell" conversation.

The smaller the test, the easier it is to improve the next version.

It also keeps the team honest about what the special is meant to prove.

## Closing Thought

If a special needs too much explanation, it may be better as an experiment in the kitchen before it becomes a promise to guests.`,
        coverImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-06T09:05:00+07:00",
        createdAt: "2026-04-06T08:45:00+07:00",
        updatedAt: "2026-04-06T09:05:00+07:00",
        author: authors.ops,
        category: "Operations",
        tags: ["specials", "ops", "staff"],
        readTime: 6,
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
        content: `The first sip sets the pace for the meal. Before the first plate arrives, a drink can tell guests what kind of attention to expect: bright and quick, warm and careful, playful and generous, or calm and precise.

## Make It Count

A bright tea, a clean broth, or a cold house drink can do more than fill time. It can reset the palate, soften the wait, and give the table a first impression that feels intentional. This is why the opening sip should be treated as part of service, not a placeholder.

The drink does not have to be complicated. It has to be clear. A good first sip should be easy to understand and easy to enjoy before the table gets crowded.

## Match the Room

Different meals need different openings. A hot day might need citrus, tea, or something lightly bitter. A rainy evening might call for broth or a warm infusion. A quick lunch might need a clean, cold pour that does not ask for too much attention.

The best choice matches the room instead of showing off.

## Watch the Details

Temperature, glassware, and timing matter. A drink that arrives too late loses its role. A drink that is too sweet can make the first savory dish feel dull. A glass that is too large can make the table feel cluttered before food appears.

- Keep the first sip small enough to finish.
- Make the flavor direction obvious.
- Serve it early enough to shape the meal.

These choices are simple, but they make service feel considered.

## A Better Way To Try It

For a restaurant, choose one house opening drink and test it across three common guest moments: solo lunch, casual dinner, and delivery pickup. If it only works in one context, name that context clearly. If it works everywhere, make it part of the story.

## How It Helps Service

A strong first sip gives staff a natural opening line. It can introduce the kitchen's mood before the food arrives and turn the wait into part of the experience. Even a small pour can make the table feel welcomed when the dining room is busy, because it shows that the restaurant has thought about the beginning of the meal.

This is especially helpful when the kitchen needs a few extra minutes. A thoughtful opening drink gives guests something pleasant to hold, taste, and talk about while the team protects the timing of the first plate.

It turns waiting into a designed part of the meal.

That small bit of care can change how the first plate is received.

## Closing Thought

Small openings matter because they give the rest of the table a tone to follow.`,
        coverImageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-05T13:10:00+07:00",
        createdAt: "2026-04-05T12:50:00+07:00",
        updatedAt: "2026-04-05T13:10:00+07:00",
        author: authors.editorial,
        category: "Service",
        tags: ["drinks", "service", "hospitality"],
        readTime: 6,
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
        content: `A calmer service usually starts long before the first order. Weekend prep is not only about making more of everything. It is about removing avoidable decisions from the busiest hours, so the team can spend its attention on timing, guests, and the dishes that actually need judgment.

## Prep With Intention

Batch what holds well, label what changes quickly, and give the busiest station fewer surprises. The best prep list is not the longest one. It is the one that understands which work becomes harder under pressure.

Some tasks can be completed early without losing quality. Others should stay close to service. Knowing the difference is what keeps prep from becoming clutter.

## Protect the Bottleneck

Every kitchen has a station that feels the weekend first. It might be grill, fry, drinks, or packing. Prep should protect that bottleneck before it helps the easier parts of the line.

- Move repeatable cuts and labels earlier.
- Keep fragile garnishes closer to service.
- Put backup tools where the station actually reaches.
- Review the menu for items that create unnecessary custom work.

Small changes can save minutes when the room starts moving faster.

## Make Labels Useful

Labels should answer the question someone will ask during service: what is it, when was it made, and what should happen next? A label that only names the container is not enough when the station is busy.

## Protect Attention

Clear labels also help new staff join the rhythm without asking the same questions every ten minutes.

## End Prep With a Walkthrough

Before service, walk the route an order will travel. From ticket to station, from station to pass, from pass to table or delivery shelf. This reveals missing spoons, awkward containers, or garnishes stored too far away.

The walkthrough does not need to be formal. It just needs to happen before the first rush exposes the gap.

## What Calm Looks Like

Calm service does not mean slow service. It means the team has fewer avoidable surprises. The station knows where the backups are, the labels answer the obvious questions, and the menu has been checked for dishes that create unnecessary friction. When that work is done early, hospitality has more room to show up later.

The best test is whether a new teammate can step in and understand the station without a long explanation. If the setup makes sense under pressure, the prep has done more than fill containers; it has made service easier to trust.

That trust is what keeps the weekend from feeling improvised.

It gives the room a steadier kind of energy.

## Closing Thought

Good prep is not only about volume. It is a way of protecting attention when the room starts moving faster.`,
        coverImageUrl: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80",
        status: "PUBLISHED",
        publishedAt: "2026-04-04T07:50:00+07:00",
        createdAt: "2026-04-04T07:20:00+07:00",
        updatedAt: "2026-04-04T07:50:00+07:00",
        author: authors.ops,
        category: "Operations",
        tags: ["prep", "service", "kitchen"],
        readTime: 6,
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
