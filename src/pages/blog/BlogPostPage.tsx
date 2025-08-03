import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  Tag,
  Eye,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { sdk } from '../../lib/config';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    bio: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  views: number;
  likes: number;
  comments: number;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  publishedAt: string;
  readTime: number;
}

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      setLoading(true);
      
      // Try to load from database first
      const posts = await sdk.queryBuilder<BlogPost>('blogPosts')
        .where((post: any) => post.slug === slug && post.published === true)
        .exec();
      
      let currentPost = posts[0];
      
      // If not found in database, use mock data
      if (!currentPost) {
        const mockPosts: BlogPost[] = [
          {
            id: '1',
            title: 'The Future of Restaurant Technology: AI-Powered Operations',
            slug: 'future-restaurant-technology-ai-powered-operations',
            excerpt: 'Discover how artificial intelligence is revolutionizing restaurant operations, from predictive analytics to automated customer service.',
            content: `
              <h2>Introduction</h2>
              <p>The restaurant industry is experiencing a technological revolution. Artificial Intelligence (AI) is no longer a futuristic concept—it's here, and it's transforming how restaurants operate, serve customers, and drive profitability.</p>
              
              <h2>AI in Restaurant Operations</h2>
              <p>Modern restaurants are leveraging AI in numerous ways:</p>
              <ul>
                <li><strong>Predictive Analytics:</strong> Forecast demand, optimize inventory, and reduce waste</li>
                <li><strong>Customer Personalization:</strong> Deliver tailored experiences based on dining history</li>
                <li><strong>Automated Ordering:</strong> Streamline the ordering process with intelligent chatbots</li>
                <li><strong>Dynamic Pricing:</strong> Optimize menu pricing based on demand and competition</li>
              </ul>
              
              <h2>The RestoAI Advantage</h2>
              <p>RestoAI takes restaurant technology to the next level by integrating advanced AI capabilities into every aspect of restaurant management. Our platform provides:</p>
              
              <h3>Intelligent Business Insights</h3>
              <p>Our AI analyzes your restaurant data to provide actionable insights that drive growth. From identifying your most profitable menu items to predicting busy periods, RestoAI helps you make data-driven decisions.</p>
              
              <h3>Automated Customer Engagement</h3>
              <p>Engage customers with personalized marketing campaigns, loyalty programs, and social media content—all powered by AI that understands your customer base.</p>
              
              <h2>Real-World Impact</h2>
              <p>Restaurants using AI-powered solutions report:</p>
              <ul>
                <li>30% reduction in food waste</li>
                <li>25% increase in customer retention</li>
                <li>40% improvement in operational efficiency</li>
                <li>20% boost in average order value</li>
              </ul>
              
              <h2>Getting Started with AI</h2>
              <p>Implementing AI in your restaurant doesn't have to be overwhelming. Start with these key areas:</p>
              <ol>
                <li><strong>Data Collection:</strong> Ensure you're capturing customer and operational data</li>
                <li><strong>Analytics Platform:</strong> Choose a comprehensive solution like RestoAI</li>
                <li><strong>Staff Training:</strong> Educate your team on new AI-powered tools</li>
                <li><strong>Gradual Implementation:</strong> Roll out features progressively</li>
              </ol>
              
              <h2>The Future is Now</h2>
              <p>The restaurants that embrace AI today will be the industry leaders of tomorrow. Don't wait—start your AI journey with RestoAI and transform your restaurant operations.</p>
              
              <p>Ready to experience the power of AI in your restaurant? <a href="/restaurant/auth">Start your free trial today</a> and see the difference intelligent technology can make.</p>
            `,
            featuredImage: '/blog/ai-restaurant.jpg',
            author: {
              name: 'Sarah Johnson',
              avatar: '/authors/sarah.jpg',
              role: 'Head of Product',
              bio: 'Sarah leads product development at RestoAI with over 10 years of experience in restaurant technology and AI solutions.'
            },
            category: 'Technology',
            tags: ['AI', 'Restaurant Tech', 'Innovation', 'Operations'],
            publishedAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-16T14:30:00Z',
            readTime: 8,
            views: 2450,
            likes: 89,
            comments: 23
          }
        ];
        
        currentPost = mockPosts.find(p => p.slug === slug) || null;
      }
      
      if (currentPost) {
        setPost(currentPost);
        
        // Load related posts
        const related: RelatedPost[] = [
          {
            id: '2',
            title: '10 Ways to Increase Restaurant Revenue with Data Analytics',
            slug: '10-ways-increase-restaurant-revenue-data-analytics',
            featuredImage: '/blog/revenue-analytics.jpg',
            publishedAt: '2024-01-12T14:30:00Z',
            readTime: 6
          },
          {
            id: '3',
            title: 'Customer Loyalty Programs That Actually Work',
            slug: 'customer-loyalty-programs-that-actually-work',
            featuredImage: '/blog/loyalty-programs.jpg',
            publishedAt: '2024-01-10T09:15:00Z',
            readTime: 5
          },
          {
            id: '4',
            title: 'The Complete Guide to Restaurant Social Media Marketing',
            slug: 'complete-guide-restaurant-social-media-marketing',
            featuredImage: '/blog/social-media.jpg',
            publishedAt: '2024-01-08T16:45:00Z',
            readTime: 12
          }
        ];
        
        setRelatedPosts(related);
        
        // Increment view count
        try {
          await sdk.update('blogPosts', currentPost.id, {
            views: currentPost.views + 1
          });
        } catch (error) {
          // Ignore error for mock data
        }
      }
      
    } catch (error) {
      console.error('Failed to load blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    try {
      const newLiked = !liked;
      const newLikes = newLiked ? post.likes + 1 : post.likes - 1;
      
      setLiked(newLiked);
      setPost({ ...post, likes: newLikes });
      
      // Update in database
      await sdk.update('blogPosts', post.id, {
        likes: newLikes
      });
      
      toast.success(newLiked ? 'Post liked!' : 'Like removed');
    } catch (error) {
      // Ignore error for mock data
      toast.success(liked ? 'Like removed' : 'Post liked!');
    }
  };

  const handleShare = async () => {
    if (!post) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Button as={Link} to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                RestoAI
              </h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-orange-500 transition-colors">Home</Link>
              <Link to="/features" className="text-gray-600 hover:text-orange-500 transition-colors">Features</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-orange-500 transition-colors">Pricing</Link>
              <Link to="/blog" className="text-orange-500 font-medium">Blog</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/restaurant/auth" className="text-gray-600 hover:text-orange-500 transition-colors">
                Sign In
              </Link>
              <Button as={Link} to="/restaurant/auth" className="bg-gradient-to-r from-orange-500 to-red-500">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Back to Blog */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center space-x-4 mb-6">
              <Badge variant="info">{post.category}</Badge>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(post.publishedAt)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime} min read
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {post.views.toLocaleString()} views
                </div>
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              {post.excerpt}
            </p>

            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">{post.author.name}</p>
                  <p className="text-sm text-gray-600">{post.author.role}</p>
                </div>
              </div>

              {/* Social Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    liked
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 lg:h-96 object-cover rounded-2xl shadow-lg"
            />
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Author Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {post.author.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{post.author.role}</p>
                  <p className="text-gray-700">{post.author.bio}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Related Articles
              </h2>
              <p className="text-gray-600">
                Continue reading with these related posts
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(relatedPost.publishedAt)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {relatedPost.readTime} min read
                        </div>
                      </div>
                      <Button
                        as={Link}
                        to={`/blog/${relatedPost.slug}`}
                        variant="outline"
                        className="w-full"
                      >
                        Read More
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Start your free trial today and experience the power of AI-driven restaurant management.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              as={Link}
              to="/restaurant/auth"
            >
              Start Free Trial
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">RestoAI</h3>
              </div>
              <p className="text-gray-400">
                The ultimate AI-powered restaurant management platform.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RestoAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPostPage;
