
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import ProjectCard from '@/components/ProjectCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

const Dashboard = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const { getFeedPosts, getUserProjects, likePost } = useData();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }
  
  if (!isAuthenticated || !user) {
    return null; // Will redirect due to the effect
  }
  
  const feedPosts = getFeedPosts();
  const userProjects = getUserProjects(user.id);

  return (
    <Layout>
      <div className="container py-8">
        {/* Hero Section with Robot Background */}
        <div className="mb-8 relative bg-firestack-primary rounded-lg p-8 overflow-hidden">
          {/* Robot background image */}
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80)'
            }}
          />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
                <p className="text-white/80">Ready to share your latest projects and insights?</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                  <Link to="/create-project">New Project</Link>
                </Button>
                <Button className="bg-white text-firestack-primary hover:bg-white/90" asChild>
                  <Link to="/create-post">Write Blog Post</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="feed">
          <TabsList className="mb-6">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="myProjects">My Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="space-y-6">
            {feedPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {feedPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onLike={() => likePost(post.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">Your feed is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Follow other users to see their posts here, or create your own posts.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild variant="outline">
                    <Link to="/explore">Discover Users</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/create-post">Write a Blog Post</Link>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="myProjects">
            {userProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  Showcase your work by creating your first project.
                </p>
                <Button asChild>
                  <Link to="/create-project">Add Project</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
