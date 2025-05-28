-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    bio TEXT,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES profiles(id),
    following_id UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(follower_id, following_id)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    cover_image TEXT,
    author_id UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(post_id, user_id)
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

-- Create post_tags table
CREATE TABLE IF NOT EXISTS post_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id),
    UNIQUE(post_id, tag_id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    link TEXT,
    author_id UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create project_technologies table
CREATE TABLE IF NOT EXISTS project_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology TEXT NOT NULL,
    UNIQUE(project_id, technology)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can follow users" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Anyone can view follows" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can unfollow" ON follows
    FOR DELETE USING (auth.uid() = follower_id);

CREATE POLICY "Posts are viewable by everyone" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Post likes are viewable by everyone" ON post_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like posts" ON post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON post_likes
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Tags are viewable by everyone" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Post tags are viewable by everyone" ON post_tags
    FOR SELECT USING (true);

CREATE POLICY "Projects are viewable by everyone" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Project technologies are viewable by everyone" ON project_technologies
    FOR SELECT USING (true);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();