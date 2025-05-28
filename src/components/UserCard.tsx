
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

interface UserCardProps {
  user: User;
}

const UserCard = ({ user }: UserCardProps) => {
  const { isFollowing, followUser, unfollowUser, user: currentUser } = useAuth();
  
  const isCurrentUser = currentUser?.id === user.id;
  const following = isFollowing(user.id);

  const handleFollowAction = () => {
    if (following) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="p-6 flex flex-col items-center">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarImage src={user.profileImage} alt={user.name} />
          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold mb-2">{user.name}</h3>
        {user.bio && (
          <p className="text-muted-foreground text-center text-sm mb-4 line-clamp-3">
            {user.bio}
          </p>
        )}
        <div className="flex gap-4 mb-4 text-sm">
          <div className="text-center">
            <p className="font-medium">{user.following.length}</p>
            <p className="text-muted-foreground">Following</p>
          </div>
          <div className="text-center">
            <p className="font-medium">{user.followers.length}</p>
            <p className="text-muted-foreground">Followers</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-secondary/20 flex justify-center">
        {isCurrentUser ? (
          <Button asChild variant="outline">
            <Link to="/profile">Edit Profile</Link>
          </Button>
        ) : (
          <Button 
            onClick={handleFollowAction}
            variant={following ? "outline" : "default"}
          >
            {following ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserCard;
