
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import QRCodeGenerator from '@/components/QRCodeGenerator';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getPost, likePost, commentOnPost } = useData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [commentContent, setCommentContent] = useState('');
  const post = getPost(id ?? '');
  
  if (!post) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Post not found</h1>
          <p className="mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/blogs')}>Back to Blogs</Button>
        </div>
      </Layout>
    );
  }
  
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const postUrl = window.location.href;
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim()) {
      commentOnPost(post.id, commentContent);
      setCommentContent('');
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <article className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <Avatar>
                <AvatarImage src={post.authorImage} alt={post.authorName} />
                <AvatarFallback>{post.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.authorName}</p>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>
            </div>
            
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto aspect-video object-cover rounded-lg mb-6"
              />
            )}
            
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </header>
          
          <div 
            className="prose max-w-none post-content mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <div className="flex justify-between items-center border-t border-b py-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => likePost(post.id)}
            >
              ❤️ {post.likes}
            </Button>
            
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(postUrl)}>
                Share Link
              </Button>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Comments ({post.comments.length})</h3>
            
            {isAuthenticated && (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <Textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                  className="mb-3"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={!commentContent.trim()}>
                    Post Comment
                  </Button>
                </div>
              </form>
            )}
            
            {post.comments.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="bg-secondary/30 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.authorImage} alt={comment.authorName} />
                        <AvatarFallback>{comment.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-4 bg-secondary/30 rounded-lg">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Share this post</h3>
            <QRCodeGenerator 
              value={postUrl} 
              title="Share This Post"
              description="Scan to read this post"
            />
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default PostDetail;
