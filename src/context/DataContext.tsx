
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post, Project, Comment } from '@/models/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface DataContextType {
  posts: Post[];
  projects: Project[];
  fetchPosts: () => void;
  fetchProjects: () => void;
  createPost: (post: Omit<Post, 'id' | 'authorId' | 'authorName' | 'authorImage' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'likedBy'>) => void;
  createProject: (project: Omit<Project, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>) => void;
  getUserPosts: (userId: string) => Post[];
  getUserProjects: (userId: string) => Project[];
  getPost: (id: string) => Post | undefined;
  getProject: (id: string) => Project | undefined;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  commentOnPost: (postId: string, content: string) => void;
  getFeedPosts: () => Post[];
  hasLikedPost: (postId: string) => boolean;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    fetchProjects();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey (
            id,
            name,
            profile_image
          ),
          post_likes (
            user_id
          ),
          comments (
            id,
            content,
            created_at,
            profiles!comments_author_id_fkey (
              id,
              name,
              profile_image
            )
          ),
          post_tags (
            tags (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const transformedPosts: Post[] = postsData?.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.cover_image,
        authorId: post.author_id,
        authorName: post.profiles?.name || 'Unknown',
        authorImage: post.profiles?.profile_image,
        createdAt: new Date(post.created_at),
        updatedAt: new Date(post.updated_at),
        likes: post.post_likes?.length || 0,
        likedBy: post.post_likes?.map(like => like.user_id) || [],
        comments: post.comments?.map(comment => ({
          id: comment.id,
          content: comment.content,
          authorId: comment.profiles?.id || '',
          authorName: comment.profiles?.name || 'Unknown',
          authorImage: comment.profiles?.profile_image,
          createdAt: new Date(comment.created_at)
        })) || [],
        tags: post.post_tags?.map(pt => pt.tags?.name).filter(Boolean) || []
      })) || [];

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        variant: "destructive",
        description: "Failed to fetch posts",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_author_id_fkey (
            id,
            name
          ),
          project_technologies (
            technology
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProjects: Project[] = projectsData?.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        image: project.image,
        link: project.link,
        authorId: project.author_id,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        technologies: project.project_technologies?.map(pt => pt.technology) || []
      })) || [];

      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        description: "Failed to fetch projects",
      });
    }
  };

  const createPost = async (postData: Omit<Post, 'id' | 'authorId' | 'authorName' | 'authorImage' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'likedBy'>) => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "You must be logged in to create a post",
      });
      return;
    }

    try {
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert({
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt,
          cover_image: postData.coverImage,
          author_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Insert tags if any
      if (postData.tags && postData.tags.length > 0) {
        for (const tagName of postData.tags) {
          // Insert tag if it doesn't exist
          await supabase
            .from('tags')
            .upsert({ name: tagName }, { onConflict: 'name' });

          // Get tag ID
          const { data: tag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();

          if (tag) {
            // Link post to tag
            await supabase
              .from('post_tags')
              .insert({
                post_id: newPost.id,
                tag_id: tag.id
              });
          }
        }
      }

      toast({
        description: "Post created successfully!",
      });

      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        variant: "destructive",
        description: "Failed to create post",
      });
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "You must be logged in to create a project",
      });
      return;
    }

    try {
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          image: projectData.image,
          link: projectData.link,
          author_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Insert technologies
      if (projectData.technologies && projectData.technologies.length > 0) {
        for (const tech of projectData.technologies) {
          await supabase
            .from('project_technologies')
            .insert({
              project_id: newProject.id,
              technology: tech
            });
        }
      }

      toast({
        description: "Project created successfully!",
      });

      // Refresh projects
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        variant: "destructive",
        description: "Failed to create project",
      });
    }
  };

  const getUserPosts = (userId: string) => {
    return posts.filter(post => post.authorId === userId);
  };

  const getUserProjects = (userId: string) => {
    return projects.filter(project => project.authorId === userId);
  };

  const getPost = (id: string) => {
    return posts.find(post => post.id === id);
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  const likePost = async (postId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "You must be logged in to like a post",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;

      sonnerToast("Post liked!", {
        description: "You liked this post",
      });

      // Refresh posts to update like count
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        variant: "destructive",
        description: "Failed to like post",
      });
    }
  };

  const unlikePost = async (postId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "You must be logged in to unlike a post",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      sonnerToast("Post unliked", {
        description: "You unliked this post",
      });

      // Refresh posts to update like count
      fetchPosts();
    } catch (error) {
      console.error('Error unliking post:', error);
      toast({
        variant: "destructive",
        description: "Failed to unlike post",
      });
    }
  };

  const commentOnPost = async (postId: string, content: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "You must be logged in to comment on a post",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content,
          post_id: postId,
          author_id: user.id
        });

      if (error) throw error;

      toast({
        description: "Comment added successfully!",
      });

      // Refresh posts to show new comment
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        description: "Failed to add comment",
      });
    }
  };

  const getFeedPosts = () => {
    if (!user) return [];
    
    return posts.filter(post => 
      post.authorId === user.id || user.following.includes(post.authorId)
    );
  };

  const hasLikedPost = (postId: string): boolean => {
    if (!user) return false;
    const post = posts.find(post => post.id === postId);
    return post ? post.likedBy.includes(user.id) : false;
  };

  return (
    <DataContext.Provider value={{ 
      posts, 
      projects, 
      fetchPosts, 
      fetchProjects, 
      createPost, 
      createProject, 
      getUserPosts, 
      getUserProjects,
      getPost,
      getProject,
      likePost,
      unlikePost,
      commentOnPost,
      getFeedPosts,
      hasLikedPost,
      loading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
