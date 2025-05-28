
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, User, Settings, LogIn, Share } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm bg-firestack-primary">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center">
              <Share className="h-5 w-5 text-firestack-primary" />
            </div>
            <span className="text-xl font-bold text-white">DevConnect</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/explore" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
            Explore
          </Link>
          <Link to="/blogs" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
            Blogs
          </Link>
          <Link to="/projects" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
            Projects
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-white/20 hover:border-white/40">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback className="bg-firestack-accent text-white">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button className="bg-white text-firestack-primary hover:bg-white/90" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="container md:hidden py-4 bg-firestack-primary">
          <nav className="flex flex-col gap-4">
            <Link 
              to="/dashboard" 
              className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/explore" 
              className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            <Link 
              to="/blogs" 
              className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs
            </Link>
            <Link 
              to="/projects" 
              className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </Link>
            
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 mt-2">
                <Button variant="ghost" className="text-white hover:bg-white/20" asChild>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Log in</Link>
                </Button>
                <Button className="bg-white text-firestack-primary hover:bg-white/90" asChild>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
