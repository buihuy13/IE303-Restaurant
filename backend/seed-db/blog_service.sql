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
