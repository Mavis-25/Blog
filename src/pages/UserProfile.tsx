
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import ProjectCard from '@/components/ProjectCard';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { useAuth, User } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { supabase } from '@/integrations/supabase/client';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'posts';

  const { isAuthenticated, user: currentUser, isFollowing, followUser, unfollowUser } = useAuth();
  const { getUserPosts, getUserProjects, likePost, hasLikedPost, unlikePost } = useData();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch following and followers
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', id);

      const { data: followersData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', id);

      const userProfile: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        bio: profile.bio || '',
        profileImage: profile.profile_image || '',
        following: followingData?.map(f => f.following_id) || [],
        followers: followersData?.map(f => f.follower_id) || []
      };

      setUser(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p>Loading user profile...</p>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">User not found</h1>
          <p className="mb-6">The user profile you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/explore')}>Back to Explore</Button>
        </div>
      </Layout>
    );
  }
  
  const userPosts = getUserPosts(user.id);
  const userProjects = getUserProjects(user.id);
  const profileUrl = window.location.href;
  
  const isCurrentUser = currentUser?.id === user.id;
  const following = isFollowing(user.id);

  const handleFollowAction = () => {
    if (following) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-semibold mb-2">{user.name}</h2>
                {user.bio && (
                  <p className="text-muted-foreground mb-4">{user.bio}</p>
                )}
                
                <div className="flex justify-center gap-8 pt-2 mb-6">
                  <div className="text-center">
                    <p className="font-bold">{user.following.length}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{user.followers.length}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                </div>
                
                {isAuthenticated && (
                  isCurrentUser ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/profile">Edit Profile</Link>
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleFollowAction}
                      variant={following ? "outline" : "default"}
                      className="w-full"
                    >
                      {following ? 'Unfollow' : 'Follow'}
                    </Button>
                  )
                )}
              </div>
            </div>
            
            <QRCodeGenerator 
              value={profileUrl}
              title="Connect with Me"
              description="Scan this QR code to view my profile"
            />
          </div>
          
          {/* Right Column - Content */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue={activeTab}>
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mt-4">
                {userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {userPosts.map(post => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        onLike={() => handlePostLike(post.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-secondary/30 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      This user hasn't created any posts yet.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="projects" className="mt-4">
                {userProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userProjects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-secondary/30 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground">
                      This user hasn't added any projects yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
