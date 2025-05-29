-- Create users table (handled by Supabase Auth)
create table if not exists auth.users (
  id uuid not null primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text not null unique,
  bio text,
  profile_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create follows table
create table if not exists public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(follower_id, following_id)
);

-- Enable Row Level Security
alter table public.follows enable row level security;

-- Create posts table
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  excerpt text not null,
  cover_image text,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.posts enable row level security;

-- Create comments table
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.comments enable row level security;

-- Create post_likes table
create table if not exists public.post_likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(post_id, user_id)
);

-- Enable Row Level Security
alter table public.post_likes enable row level security;

-- Create tags table
create table if not exists public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique
);

-- Enable Row Level Security
alter table public.tags enable row level security;

-- Create post_tags table
create table if not exists public.post_tags (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  tag_id uuid references public.tags(id) not null,
  unique(post_id, tag_id)
);

-- Enable Row Level Security
alter table public.post_tags enable row level security;

-- Create projects table
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  image text,
  link text,
  author_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.projects enable row level security;

-- Create project_technologies table
create table if not exists public.project_technologies (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  technology text not null,
  unique(project_id, technology)
);

-- Enable Row Level Security
alter table public.project_technologies enable row level security;

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at columns
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function update_updated_at_column();

create trigger update_posts_updated_at
  before update on public.posts
  for each row
  execute function update_updated_at_column();

create trigger update_projects_updated_at
  before update on public.projects
  for each row
  execute function update_updated_at_column();

-- Create RLS policies

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Follows policies
create policy "Anyone can view follows"
  on follows for select
  using (true);

create policy "Anyone can follow users"
  on follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete
  using (auth.uid() = follower_id);

-- Posts policies
create policy "Posts are viewable by everyone"
  on posts for select
  using (true);

create policy "Authenticated users can create posts"
  on posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update own posts"
  on posts for update
  using (auth.uid() = author_id);

create policy "Users can delete own posts"
  on posts for delete
  using (auth.uid() = author_id);

-- Comments policies
create policy "Comments are viewable by everyone"
  on comments for select
  using (true);

create policy "Authenticated users can comment"
  on comments for insert
  with check (auth.uid() = author_id);

create policy "Users can delete own comments"
  on comments for delete
  using (auth.uid() = author_id);

-- Post likes policies
create policy "Post likes are viewable by everyone"
  on post_likes for select
  using (true);

create policy "Authenticated users can like posts"
  on post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike posts"
  on post_likes for delete
  using (auth.uid() = user_id);

-- Tags policies
create policy "Tags are viewable by everyone"
  on tags for select
  using (true);

-- Post tags policies
create policy "Post tags are viewable by everyone"
  on post_tags for select
  using (true);

-- Projects policies
create policy "Projects are viewable by everyone"
  on projects for select
  using (true);

create policy "Authenticated users can create projects"
  on projects for insert
  with check (auth.uid() = author_id);

create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = author_id);

create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = author_id);

-- Project technologies policies
create policy "Project technologies are viewable by everyone"
  on project_technologies for select
  using (true);