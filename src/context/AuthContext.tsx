
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  profileImage?: string;
  followers: string[];
  following: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;

      // Fetch following and followers
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', supabaseUser.id);

      const { data: followersData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', supabaseUser.id);

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
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        description: "Logged in successfully!",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) throw error;

      toast({
        description: "Account created successfully! Please check your email to verify your account.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Signup failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      toast({
        description: "Logged out successfully",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Logout failed",
      });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          bio: data.bio,
          profile_image: data.profileImage
        })
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      toast({
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Failed to update profile",
      });
    }
  };

  const followUser = async (userId: string) => {
    if (!user) return;
    
    if (user.following.includes(userId)) {
      toast({
        description: "You are already following this user",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;

      const updatedUser = {
        ...user,
        following: [...user.following, userId]
      };
      
      setUser(updatedUser);
      toast({
        description: "User followed successfully!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Failed to follow user",
      });
    }
  };
  
  const unfollowUser = async (userId: string) => {
    if (!user) return;
    
    if (!user.following.includes(userId)) {
      toast({
        description: "You are not following this user",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      const updatedUser = {
        ...user,
        following: user.following.filter(id => id !== userId)
      };
      
      setUser(updatedUser);
      toast({
        description: "User unfollowed successfully!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Failed to unfollow user",
      });
    }
  };
  
  const isFollowing = (userId: string): boolean => {
    if (!user) return false;
    return user.following.includes(userId);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      signup, 
      logout, 
      updateProfile,
      followUser,
      unfollowUser,
      isFollowing,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
