
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import ProjectCard from '@/components/ProjectCard';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { isAuthenticated, user, updateProfile } = useAuth();
  const { getUserPosts, getUserProjects, likePost } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setProfileImage(user.profileImage || '');
    }
  }, [isAuthenticated, user, navigate]);
  
  if (!isAuthenticated || !user) {
    return null; // Will redirect due to the effect
  }
  
  const userPosts = getUserPosts(user.id);
  const userProjects = getUserProjects(user.id);
  const profileUrl = window.location.origin + `/users/${user.id}`;

  const handleSave = () => {
    updateProfile({
      name,
      bio,
      profileImage
    });
    setEditing(false);
    toast({
      description: "Profile updated successfully!",
    });
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your public profile and information</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card border rounded-lg p-6">
              {editing ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileImage} alt={name} />
                      <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profileImage">Profile Image URL</Label>
                    <Input
                      id="profileImage"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold">{user.name}</h2>
                    {user.bio && (
                      <p className="text-muted-foreground mt-2">{user.bio}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-center gap-8 pt-2">
                    <div className="text-center">
                      <p className="font-bold">{user.following.length}</p>
                      <p className="text-sm text-muted-foreground">Following</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{user.followers.length}</p>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
            
            <QRCodeGenerator 
              value={profileUrl}
              title="Share Your Profile"
              description="Scan this QR code to connect"
            />
          </div>
          
          {/* Right Column - Content */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="posts">
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mt-4">
                <div className="flex justify-end mb-4">
                  <Button asChild>
                    <Link to="/create-post">New Post</Link>
                  </Button>
                </div>
                
                {userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {userPosts.map(post => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        onLike={() => likePost(post.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-secondary/30 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">You haven't written any posts yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Share your knowledge and insights by creating your first post.
                    </p>
                    <Button asChild>
                      <Link to="/create-post">Write a Post</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="projects" className="mt-4">
                <div className="flex justify-end mb-4">
                  <Button asChild>
                    <Link to="/create-project">New Project</Link>
                  </Button>
                </div>
                
                {userProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userProjects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-secondary/30 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">You haven't added any projects yet</h3>
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
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
