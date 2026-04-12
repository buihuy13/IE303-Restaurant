CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table blog_posts (
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

create index idx_blog_posts_author_id on blog_posts(author_id);
create index idx_blog_posts_status on blog_posts(status);
create index idx_blog_posts_created_at on blog_posts(created_at desc);
create index idx_blog_posts_published_at on blog_posts(published_at desc);

create table blog_images (
    id UUID DEFAULT gen_random_uuid() primary key,
    author_id UUID not null,
    blog_post_id UUID references blog_posts(id) on delete set null,
    image_url text not null unique,
    public_id varchar(255) not null unique,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create index idx_blog_images_author_id on blog_images(author_id);
create index idx_blog_images_blog_post_id on blog_images(blog_post_id);

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
    $$Start with a small bowl, a warm counter, and a table close enough to hear the city waking up.

## The Route

- Begin with a light noodle bowl and fresh herbs.
- Walk to the next block before coffee.
- Save the richest dish for the final stop.

The best breakfast route is not built around speed. It is built around texture, broth, and the quiet confidence of kitchens that have repeated the same rhythm for years.$$,
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
    $$A good menu tells you how the kitchen wants to move.

## What to Notice

- Short sections usually mean tighter prep.
- Seasonal notes point to dishes that change often.
- Repeated sauces or garnishes can reveal the house style.

Before lunch gets loud, scan for the dish that looks simple but specific. That is often where the restaurant has the most confidence.$$,
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
    $$Delivery food has to survive time, steam, and movement.

## Better Travel Notes

- Keep crisp elements separate.
- Use sauces that can be added at the table.
- Choose packaging that vents without drying the dish.

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
    $$A lunch menu improves when it stops trying to carry the whole day.

## Keep the Center Clear

Choose one anchor, one bright side, and one comfort dish. Then let the rest support those decisions.

Fresh herbs, a sharp pickle, or a clean broth can make the menu feel lighter without making it feel small.$$,
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
    $$Food photos do not need to be loud to be useful.

## Try This

- Move the plate closer to natural light.
- Leave one honest imperfection in the frame.
- Shoot the dish before the garnish fades.

The strongest image usually feels like someone is about to sit down, not like the table has been frozen for inspection.$$,
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
    $$Specials are strongest when they create focus instead of noise.

## Useful Signals

- Staff can explain the dish in one sentence.
- Prep does not interrupt the core menu.
- The dish has a clear reason to exist today.

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
    $$The first sip sets the pace for the meal.

## Make It Count

A bright tea, a clean broth, or a cold house drink can tell guests what kind of attention to expect next.

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
    $$A calmer service usually starts long before the first order.

## Prep With Intention

- Batch what holds well.
- Label what changes quickly.
- Give the busiest station fewer surprises.

Good prep is not only about volume. It is a way of protecting attention when the room starts moving faster.$$,
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80',
    'PUBLISHED',
    timestamp '2026-04-11 07:50:00',
    timestamp '2026-04-11 07:20:00',
    timestamp '2026-04-11 07:50:00'
)
on conflict (slug) do nothing;
