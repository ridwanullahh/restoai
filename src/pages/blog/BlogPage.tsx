import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  ArrowRight,
  Tag,
  TrendingUp,
  Star,
  Filter
} from 'lucide-react';
import { sdk } from '../../lib/config';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';

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
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  featured: boolean;
  views: number;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadBlogData();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, searchTerm, selectedCategory, sortBy]);

  const loadBlogData = async () => {
    try {
      setLoading(true);
      
      // Load blog posts
      const postsData = await sdk.queryBuilder<BlogPost>('blogPosts')
        .where((post: any) => post.published === true)
        .sort('publishedAt', 'desc')
        .exec();
      
      // Generate mock blog posts if none exist
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'The Future of Restaurant Technology: AI-Powered Operations',
          slug: 'future-restaurant-technology-ai-powered-operations',
          excerpt: 'Discover how artificial intelligence is revolutionizing restaurant operations, from predictive analytics to automated customer service.',
          content: 'Full blog content here...',
          featuredImage: '/blog/ai-restaurant.jpg',
          author: {
            name: 'Sarah Johnson',
            avatar: '/authors/sarah.jpg',
            role: 'Head of Product'
          },
          category: 'Technology',
          tags: ['AI', 'Restaurant Tech', 'Innovation'],
          publishedAt: '2024-01-15T10:00:00Z',
          readTime: 8,
          featured: true,
          views: 2450
        },
        {
          id: '2',
          title: '10 Ways to Increase Restaurant Revenue with Data Analytics',
          slug: '10-ways-increase-restaurant-revenue-data-analytics',
          excerpt: 'Learn practical strategies to boost your restaurant\'s profitability using data-driven insights and analytics.',
          content: 'Full blog content here...',
          featuredImage: '/blog/revenue-analytics.jpg',
          author: {
            name: 'Michael Chen',
            avatar: '/authors/michael.jpg',
            role: 'Business Analyst'
          },
          category: 'Business',
          tags: ['Revenue', 'Analytics', 'Growth'],
          publishedAt: '2024-01-12T14:30:00Z',
          readTime: 6,
          featured: false,
          views: 1890
        },
        {
          id: '3',
          title: 'Customer Loyalty Programs That Actually Work',
          slug: 'customer-loyalty-programs-that-actually-work',
          excerpt: 'Explore effective loyalty program strategies that keep customers coming back and increase lifetime value.',
          content: 'Full blog content here...',
          featuredImage: '/blog/loyalty-programs.jpg',
          author: {
            name: 'Emma Rodriguez',
            avatar: '/authors/emma.jpg',
            role: 'Marketing Director'
          },
          category: 'Marketing',
          tags: ['Loyalty', 'Customer Retention', 'Marketing'],
          publishedAt: '2024-01-10T09:15:00Z',
          readTime: 5,
          featured: false,
          views: 1650
        },
        {
          id: '4',
          title: 'The Complete Guide to Restaurant Social Media Marketing',
          slug: 'complete-guide-restaurant-social-media-marketing',
          excerpt: 'Master social media marketing for your restaurant with proven strategies, content ideas, and engagement tactics.',
          content: 'Full blog content here...',
          featuredImage: '/blog/social-media.jpg',
          author: {
            name: 'David Park',
            avatar: '/authors/david.jpg',
            role: 'Social Media Manager'
          },
          category: 'Marketing',
          tags: ['Social Media', 'Marketing', 'Engagement'],
          publishedAt: '2024-01-08T16:45:00Z',
          readTime: 12,
          featured: true,
          views: 3200
        },
        {
          id: '5',
          title: 'Streamlining Kitchen Operations with Digital Tools',
          slug: 'streamlining-kitchen-operations-digital-tools',
          excerpt: 'Optimize your kitchen workflow with digital solutions that reduce waste, improve efficiency, and enhance food quality.',
          content: 'Full blog content here...',
          featuredImage: '/blog/kitchen-operations.jpg',
          author: {
            name: 'Chef Maria Santos',
            avatar: '/authors/maria.jpg',
            role: 'Culinary Consultant'
          },
          category: 'Operations',
          tags: ['Kitchen', 'Operations', 'Efficiency'],
          publishedAt: '2024-01-05T11:20:00Z',
          readTime: 7,
          featured: false,
          views: 1420
        },
        {
          id: '6',
          title: 'Understanding Restaurant Analytics: Key Metrics That Matter',
          slug: 'understanding-restaurant-analytics-key-metrics',
          excerpt: 'Learn which restaurant metrics to track and how to use them to make data-driven decisions for your business.',
          content: 'Full blog content here...',
          featuredImage: '/blog/restaurant-metrics.jpg',
          author: {
            name: 'Alex Thompson',
            avatar: '/authors/alex.jpg',
            role: 'Data Scientist'
          },
          category: 'Analytics',
          tags: ['Analytics', 'Metrics', 'Data'],
          publishedAt: '2024-01-03T13:10:00Z',
          readTime: 9,
          featured: false,
          views: 1780
        }
      ];

      setPosts(postsData.length > 0 ? postsData : mockPosts);

      // Generate categories
      const categoryMap = new Map();
      mockPosts.forEach(post => {
        if (categoryMap.has(post.category)) {
          categoryMap.set(post.category, categoryMap.get(post.category) + 1);
        } else {
          categoryMap.set(post.category, 1);
        }
      });

      const categoriesData: BlogCategory[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
        id: name.toLowerCase(),
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        count
      }));

      setCategories(categoriesData);

    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPosts = () => {
    let filtered = posts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category.toLowerCase() === selectedCategory);
    }

    // Sort posts
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredPosts(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const featuredPost = posts.find(post => post.featured) || posts[0];

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

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                RestoAI
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent block">
                  Blog
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Insights, tips, and strategies to help you succeed in the restaurant industry. 
                Stay updated with the latest trends and best practices.
              </p>
            </motion.div>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative">
                    <img
                      src={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="warning" className="bg-orange-500 text-white">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge variant="info">{featuredPost.category}</Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {featuredPost.readTime} min read
                      </div>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={featuredPost.author.avatar}
                          alt={featuredPost.author.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{featuredPost.author.name}</p>
                          <p className="text-sm text-gray-500">{formatDate(featuredPost.publishedAt)}</p>
                        </div>
                      </div>
                      <Button
                        as={Link}
                        to={`/blog/${featuredPost.slug}`}
                        variant="outline"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
                className="w-full sm:w-80"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...categories.map(cat => ({ value: cat.slug, label: `${cat.name} (${cat.count})` }))
                ]}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
            
            <Select
              options={[
                { value: 'latest', label: 'Latest' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'featured', label: 'Featured' }
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                    <div className="relative">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      {post.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge variant="warning" className="bg-orange-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-center space-x-4 mb-3">
                        <Badge variant="info">{post.category}</Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime} min read
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" size="sm">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center space-x-3">
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                            <p className="text-xs text-gray-500">{formatDate(post.publishedAt)}</p>
                          </div>
                        </div>
                        <Button
                          as={Link}
                          to={`/blog/${post.slug}`}
                          size="sm"
                          variant="outline"
                        >
                          Read More
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Stay Updated
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Get the latest restaurant industry insights and RestoAI updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="flex-1 bg-white"
              />
              <Button className="bg-white text-orange-500 hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
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

export default BlogPage;
