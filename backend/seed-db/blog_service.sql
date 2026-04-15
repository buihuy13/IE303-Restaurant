CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table if not exists blog_posts (
    id UUID DEFAULT gen_random_uuid() primary key,
    author_id UUID not null,
    title varchar(255) not null,
    slug varchar(300) not null unique,
    content text not null,
    cover_image_url text,
    public_id varchar(255),
    status varchar(20) not null default 'DRAFT',
    published_at timestamp,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    constraint chk_blog_posts_status check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);

create index if not exists idx_blog_posts_author_id on blog_posts(author_id);
create index if not exists idx_blog_posts_status on blog_posts(status);
create index if not exists idx_blog_posts_created_at on blog_posts(created_at desc);
create index if not exists idx_blog_posts_published_at on blog_posts(published_at desc);

alter table blog_posts add column if not exists excerpt text;
alter table blog_posts add column if not exists category varchar(120);
alter table blog_posts add column if not exists read_time integer not null default 1;
alter table blog_posts add column if not exists featured boolean not null default false;
alter table blog_posts add column if not exists views_count bigint not null default 0;
alter table blog_posts add column if not exists likes_count bigint not null default 0;
alter table blog_posts add column if not exists comments_count bigint not null default 0;
alter table blog_posts add column if not exists template_key varchar(80);
alter table blog_posts add column if not exists template_version varchar(40);

create table if not exists blog_post_tags (
    blog_post_id UUID not null references blog_posts(id) on delete cascade,
    tag varchar(80) not null,
    primary key (blog_post_id, tag)
);

create index if not exists idx_blog_post_tags_tag on blog_post_tags(tag);

create table if not exists blog_images (
    id UUID DEFAULT gen_random_uuid() primary key,
    author_id UUID not null,
    blog_post_id UUID references blog_posts(id) on delete set null,
    image_url text not null unique,
    public_id varchar(255) not null unique,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create index if not exists idx_blog_images_author_id on blog_images(author_id);
create index if not exists idx_blog_images_blog_post_id on blog_images(blog_post_id);

create table if not exists blog_comments (
    id UUID DEFAULT gen_random_uuid() primary key,
    blog_post_id UUID not null references blog_posts(id) on delete cascade,
    author_id UUID,
    guest_name varchar(120) not null,
    guest_email varchar(255) not null,
    content text not null,
    notify boolean not null default false,
    status varchar(20) not null default 'PUBLISHED',
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    constraint chk_blog_comments_status check (status in ('PUBLISHED', 'PENDING', 'HIDDEN'))
);

create index if not exists idx_blog_comments_blog_post_id on blog_comments(blog_post_id);
create index if not exists idx_blog_comments_status_created_at on blog_comments(status, created_at desc);

create table if not exists blog_likes (
    id UUID DEFAULT gen_random_uuid() primary key,
    blog_post_id UUID not null references blog_posts(id) on delete cascade,
    user_id UUID not null,
    created_at timestamp default current_timestamp,
    constraint uk_blog_likes_blog_user unique (blog_post_id, user_id)
);

create index if not exists idx_blog_likes_blog_post_id on blog_likes(blog_post_id);

insert into blog_posts (
    author_id,
    title,
    slug,
    content,
    cover_image_url,
    status,
    published_at,
    created_at,
    updated_at
) values
(
    '00000000-0000-0000-0000-000000000101',
    'A Saigon Breakfast Route for Slow Mornings',
    'saigon-breakfast-route-slow-mornings',
    $$Start with a small bowl, a warm counter, and a table close enough to hear the city waking up. A slow Saigon breakfast is less about checking famous stops off a list and more about noticing how each kitchen carries the morning: the first ladle of broth, the first basket of herbs, the first glass of coffee sweating beside the curb.

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

The best Saigon breakfast routes are not built around speed. They are built around texture, broth, and the quiet confidence of kitchens that have repeated the same rhythm for years.$$,
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1600&q=80',
    'PUBLISHED',
    timestamp '2026-04-01 08:30:00',
    timestamp '2026-04-01 08:00:00',
    timestamp '2026-04-01 08:30:00'
),
(
    '00000000-0000-0000-0000-000000000101',
    'How to Read a Menu Before the Rush',
    'how-to-read-menu-before-rush',
    $$A good menu tells you how the kitchen wants to move before the room gets loud. If you read it carefully, you can see what the team has prepared for, which dishes they trust, and where the strongest meal is likely to happen.

## What to Notice

Start with the shape of the menu instead of the dish names. Short sections usually mean tighter prep. A seasonal line often points to something the kitchen is actively watching. Repeated sauces, garnishes, or side dishes can reveal the house style, especially when they appear across very different plates.

The most useful clues are rarely loud. They are small patterns that show how the kitchen wants service to flow.

## Find the Confident Dish

Before lunch gets busy, scan for the dish that looks simple but specific. A menu item with a clear protein, one sharp sauce, and a seasonal side often has more confidence than a plate carrying too many ideas.

Good dishes do not need to explain themselves for a paragraph. They should tell you what they are, why they belong on the menu, and what kind of appetite they are meant to answer.

## Ask One Better Question

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

A better menu read does not make dining complicated. It makes the meal calmer. You stop chasing the biggest promise and start choosing the dish the restaurant is already set up to do well.$$,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    'PUBLISHED',
    timestamp '2026-04-03 10:15:00',
    timestamp '2026-04-03 09:40:00',
    timestamp '2026-04-03 10:15:00'
),
(
    '00000000-0000-0000-0000-000000000101',
    'The Quiet Work Behind a Better Delivery Plate',
    'quiet-work-behind-better-delivery-plate',
    $$Delivery food has to survive time, steam, and movement. A plate that feels sharp in the dining room can turn dull on the road if the kitchen does not plan for what happens after the handoff. Better delivery is not only a packaging problem. It is a menu design problem, a timing problem, and a guest expectation problem.

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

The goal is not to recreate the dining room. The goal is to let the dish arrive with its main idea still intact.$$,
    'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1600&q=80',
    'PUBLISHED',
    timestamp '2026-04-05 14:00:00',
    timestamp '2026-04-05 13:20:00',
    timestamp '2026-04-05 14:00:00'
),
(
    '00000000-0000-0000-0000-000000000101',
    'Market Notes for a Cleaner Lunch Menu',
    'market-notes-cleaner-lunch-menu',
    $$A lunch menu improves when it stops trying to carry the whole day. The strongest midday menus are focused enough to read quickly, flexible enough to serve different appetites, and clean enough that the kitchen can execute them during a rush without losing the details that make the food feel alive.

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

A better lunch menu does not feel smaller. It feels calmer. It gives the guest a clean path to a good decision and gives the kitchen enough room to protect quality.$$,
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    'PUBLISHED',
    timestamp '2026-04-06 11:45:00',
    timestamp '2026-04-06 11:10:00',
    timestamp '2026-04-06 11:45:00'
),
(
    '00000000-0000-0000-0000-000000000101',
    'A Small Guide to Better Table Photos',
    'small-guide-better-table-photos',
    $$Food photos do not need to be loud to be useful. The best table images make someone feel invited, not interrupted. They show the dish clearly, keep the mood honest, and leave enough life in the frame that the meal still feels like it belongs to a real table.

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

The strongest table photo usually feels like someone is about to sit down, not like the table has been frozen for inspection.$$,
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80',
    'PUBLISHED',
    timestamp '2026-04-08 16:25:00',
    timestamp '2026-04-08 15:55:00',
    timestamp '2026-04-08 16:25:00'
),
(
    '00000000-0000-0000-0000-000000000101',
    'When a Restaurant Should Simplify Specials',
    'when-restaurant-should-simplify-specials',
    $$Specials are strongest when they create focus instead of noise. A good special gives the team something timely to talk about and gives guests a reason to pay attention. A weak special adds prep, slows service, and leaves everyone explaining why the dish exists.

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

If a special needs too much explanation, it may be better as an experiment in the kitchen before it becomes a promise to guests.$$,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
    'PUBLISHED',
    timestamp '2026-04-09 09:05:00',
    timestamp '2026-04-09 08:45:00',
    timestamp '2026-04-09 09:05:00'
),
(
    '00000000-0000-0000-0000-000000000101',
    'Why the First Sip Matters',
    'why-the-first-sip-matters',
    $$The first sip sets the pace for the meal. Before the first plate arrives, a drink can tell guests what kind of attention to expect: bright and quick, warm and careful, playful and generous, or calm and precise.

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

Small openings matter because they give the rest of the table a tone to follow.$$,
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1600&q=80',
    'PUBLISHED',
    timestamp '2026-04-10 13:10:00',
    timestamp '2026-04-10 12:50:00',
    timestamp '2026-04-10 13:10:00'
),
(
    '00000000-0000-0000-0000-000000000101',
    'Weekend Prep That Keeps Service Calm',
    'weekend-prep-keeps-service-calm',
    $$A calmer service usually starts long before the first order. Weekend prep is not only about making more of everything. It is about removing avoidable decisions from the busiest hours, so the team can spend its attention on timing, guests, and the dishes that actually need judgment.

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

Good prep is not only about volume. It is a way of protecting attention when the room starts moving faster.$$,
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80',
    'PUBLISHED',
    timestamp '2026-04-11 07:50:00',
    timestamp '2026-04-11 07:20:00',
    timestamp '2026-04-11 07:50:00'
)
on conflict (slug) do update set
    author_id = excluded.author_id,
    title = excluded.title,
    content = excluded.content,
    cover_image_url = excluded.cover_image_url,
    status = excluded.status,
    published_at = excluded.published_at,
    updated_at = excluded.updated_at;

update blog_posts as b
set
    excerpt = seed.excerpt,
    category = seed.category,
    read_time = seed.read_time,
    featured = seed.featured,
    views_count = seed.views_count,
    likes_count = seed.likes_count,
    comments_count = seed.comments_count,
    template_key = seed.template_key,
    template_version = seed.template_version,
    updated_at = current_timestamp
from (
    values
        (
            'saigon-breakfast-route-slow-mornings',
            'A slow route through Saigon breakfast counters, broth, coffee, and the quiet rhythm of a city waking up.',
            'City Guides',
            5,
            true,
            1842,
            126,
            0,
            'food_editorial',
            '1'
        ),
        (
            'how-to-read-menu-before-rush',
            'A practical guide to reading restaurant menus by rhythm, confidence, prep signals, and better guest questions.',
            'Restaurant Guide',
            4,
            false,
            1398,
            89,
            0,
            'restaurant_guide',
            '1'
        ),
        (
            'quiet-work-behind-better-delivery-plate',
            'How restaurants can design delivery food around steam, texture, timing, and the last five minutes of travel.',
            'Delivery',
            5,
            false,
            1224,
            74,
            0,
            'menu_strategy',
            '1'
        ),
        (
            'market-notes-cleaner-lunch-menu',
            'A focused lunch menu strategy for faster decisions, calmer service, and fresher market-led plates.',
            'Menu Strategy',
            4,
            true,
            2254,
            143,
            0,
            'menu_strategy',
            '1'
        ),
        (
            'small-guide-better-table-photos',
            'Simple food photography notes for natural light, honest details, and table images that feel inviting.',
            'Photography',
            4,
            true,
            2037,
            118,
            0,
            'food_editorial',
            '1'
        ),
        (
            'when-restaurant-should-simplify-specials',
            'A clear framework for deciding when restaurant specials add focus, and when they slow the kitchen down.',
            'Operations',
            5,
            false,
            981,
            52,
            0,
            'menu_strategy',
            '1'
        ),
        (
            'why-the-first-sip-matters',
            'Why a first drink can set the tone for service, soften the wait, and shape the meal before food arrives.',
            'Service Notes',
            4,
            false,
            1127,
            67,
            0,
            'food_editorial',
            '1'
        ),
        (
            'weekend-prep-keeps-service-calm',
            'A weekend prep checklist for protecting bottlenecks, labels, walkthroughs, and attention during busy service.',
            'Operations',
            5,
            false,
            1466,
            91,
            0,
            'menu_strategy',
            '1'
        )
) as seed(slug, excerpt, category, read_time, featured, views_count, likes_count, comments_count, template_key, template_version)
where b.slug = seed.slug;

insert into blog_post_tags (blog_post_id, tag)
select b.id, seed.tag
from blog_posts b
join (
    values
        ('saigon-breakfast-route-slow-mornings', 'breakfast'),
        ('saigon-breakfast-route-slow-mornings', 'saigon'),
        ('saigon-breakfast-route-slow-mornings', 'coffee'),
        ('how-to-read-menu-before-rush', 'menu'),
        ('how-to-read-menu-before-rush', 'ordering'),
        ('how-to-read-menu-before-rush', 'restaurant'),
        ('quiet-work-behind-better-delivery-plate', 'delivery'),
        ('quiet-work-behind-better-delivery-plate', 'packaging'),
        ('quiet-work-behind-better-delivery-plate', 'quality'),
        ('market-notes-cleaner-lunch-menu', 'lunch'),
        ('market-notes-cleaner-lunch-menu', 'menu'),
        ('market-notes-cleaner-lunch-menu', 'market'),
        ('small-guide-better-table-photos', 'photography'),
        ('small-guide-better-table-photos', 'content'),
        ('small-guide-better-table-photos', 'table'),
        ('when-restaurant-should-simplify-specials', 'specials'),
        ('when-restaurant-should-simplify-specials', 'operations'),
        ('when-restaurant-should-simplify-specials', 'service'),
        ('why-the-first-sip-matters', 'drinks'),
        ('why-the-first-sip-matters', 'service'),
        ('why-the-first-sip-matters', 'hospitality'),
        ('weekend-prep-keeps-service-calm', 'prep'),
        ('weekend-prep-keeps-service-calm', 'operations'),
        ('weekend-prep-keeps-service-calm', 'kitchen')
) as seed(slug, tag) on b.slug = seed.slug
on conflict (blog_post_id, tag) do nothing;
