import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import { useData } from '@/context/DataContext';

const Index = () => {
  const { posts } = useData();
  
  const featuredPosts = posts.slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-firestack-primary">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Connect, Share, Grow
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10">
            Join the community of developers and creators. Share your projects, write blog posts,
            and connect with like-minded individuals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-firestack-primary hover:bg-white/90" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20" asChild>
              <Link to="/explore">Explore</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20" asChild>
              <Link to="/create-post">Write Blog</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-firestack-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join DevConnect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="firestack-card p-8">
              <div className="h-12 w-12 bg-firestack-muted text-firestack-primary flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Showcase Your Work</h3>
              <p className="text-muted-foreground">
                Create a portfolio of your projects and blog posts to showcase your skills and expertise.
              </p>
            </div>
            <div className="firestack-card p-8">
              <div className="h-12 w-12 bg-firestack-muted text-firestack-primary flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect with Others</h3>
              <p className="text-muted-foreground">
                Find and connect with other developers who share your interests and expertise.
              </p>
            </div>
            <div className="firestack-card p-8">
              <div className="h-12 w-12 bg-firestack-muted text-firestack-primary flex items-center justify-center rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Knowledge</h3>
              <p className="text-muted-foreground">
                Write blog posts to share your knowledge and insights with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Posts</h2>
            <Button variant="outline" className="border-firestack-primary text-firestack-primary hover:bg-firestack-muted" asChild>
              <Link to="/blogs">View all posts</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-firestack-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join DevConnect Today</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/80">
            Start building your developer community, share your knowledge,
            and discover amazing projects from peers.
          </p>
          <Button size="lg" className="bg-white text-firestack-primary hover:bg-white/90" asChild>
            <Link to="/signup">Sign up now</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
