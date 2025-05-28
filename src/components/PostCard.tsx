
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Post } from '@/models/types';
import { MessageSquare, Heart } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  onLike?: () => void;
}

const PostCard = ({ post, onLike }: PostCardProps) => {
  const { hasLikedPost } = useData();
  const userHasLiked = hasLikedPost(post.id);
  
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="firestack-card overflow-hidden h-full flex flex-col">
      {post.coverImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-2">
          <Link to={`/users/${post.authorId}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.authorImage} alt={post.authorName} />
              <AvatarFallback className="bg-firestack-accent text-white">{post.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/users/${post.authorId}`}>
              <p className="text-sm font-medium hover:underline">{post.authorName}</p>
            </Link>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        <Link to={`/posts/${post.id}`}>
          <h3 className="text-xl font-semibold hover:text-firestack-primary transition-colors">
            {post.title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 flex-grow">
        <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="firestack-badge px-3 py-1">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 md:p-6 border-t bg-gray-50 flex justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn("flex items-center gap-1", userHasLiked && "text-red-500")}
            onClick={onLike}
            disabled={userHasLiked}
          >
            <Heart className={cn("h-4 w-4", userHasLiked && "fill-current")} />
            <span>{post.likes}</span>
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments.length}</span>
          </div>
        </div>
        <Button asChild size="sm" className="bg-firestack-primary hover:bg-firestack-accent text-white">
          <Link to={`/posts/${post.id}`}>Read more</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
