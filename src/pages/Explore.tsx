
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import ProjectCard from '@/components/ProjectCard';
import UserCard from '@/components/UserCard';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Search } from 'lucide-react';
import { User } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Explore = () => {
  const { posts, projects, likePost, hasLikedPost, unlikePost } = useData();
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'posts';
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each profile, fetch their following and followers
      const usersWithFollows = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: followingData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', profile.id);

          const { data: followersData } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('following_id', profile.id);

          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            bio: profile.bio || '',
            profileImage: profile.profile_image || '',
            following: followingData?.map(f => f.following_id) || [],
            followers: followersData?.map(f => f.follower_id) || []
          };
        })
      );

      setUsers(usersWithFollows);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  
  // Filter content based on search query
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePostLike = (postId: string) => {
    if (hasLikedPost(postId)) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Explore</h1>
            <p className="text-muted-foreground">Discover posts, projects, and connect with other developers</p>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10 w-full md:w-[300px]"
                placeholder="Search posts, projects, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    onLike={() => handlePostLike(post.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No posts matching "${searchQuery}"` 
                    : "There are no posts available at the moment"}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="projects" className="mt-6">
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No projects matching "${searchQuery}"` 
                    : "There are no projects available at the moment"}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="people" className="mt-6">
            {loadingUsers ? (
              <div className="text-center py-12">
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers
                  .filter(u => u.id !== currentUser?.id) // Don't show current user
                  .map(user => (
                    <UserCard key={user.id} user={user} />
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No users matching "${searchQuery}"` 
                    : "There are no users available at the moment"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Explore;
