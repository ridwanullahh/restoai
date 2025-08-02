import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, Tag, Search, ArrowRight, Clock } from 'lucide-react';
import { sdk } from '../lib/config';
import { BlogPost, Restaurant } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BlogPage: React.FC = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    if (restaurantSlug) {
      loadData();
    }
  }, [restaurantSlug]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load restaurant
      const restaurants = await sdk.queryBuilder<Restaurant>('restaurants')
        .where(r => r.slug === restaurantSlug && r.active === true)
        .exec();
      
      if (restaurants.length === 0) {
        navigate('/');
        return;
      }
      
      setRestaurant(restaurants[0]);
      
      // Load published blog posts
      const blogPosts = await sdk.queryBuilder<BlogPost>('blogPosts')
        .where(post => post.restaurantId === restaurants[0].id && post.status === 'published')
        .sort('publishedAt', 'desc')
        .exec();
      
      setPosts(blogPosts);
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        await sdk.update('blogPosts', postId, {
          viewCount: post.viewCount + 1,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const handlePostClick = (post: BlogPost) => {
    incrementViewCount(post.id);
    navigate(`/${restaurantSlug}/blog/${post.slug}`);
  };

  // Get unique categories and tags
  const allCategories = Array.from(new Set(posts.flatMap(post => post.categories)));
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.categories.includes(selectedCategory);
    const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">The restaurant you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link to={`/${restaurantSlug}`} className="text-2xl font-bold text-gray-900 hover:text-orange-600">
                {restaurant.name}
              </Link>
              <p className="text-gray-600 mt-1">Blog & Stories</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to={`/${restaurantSlug}`}>
                <Button variant="outline">Back to Restaurant</Button>
              </Link>
              <Link to={`/${restaurantSlug}/menu`}>
                <Button>View Menu</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Stories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the passion, recipes, and stories behind {restaurant.name}. 
            From chef insights to seasonal specials, stay connected with our culinary journey.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {allCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <Card className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {posts.length === 0 ? 'No blog posts yet' : 'No posts found'}
            </h3>
            <p className="text-gray-600">
              {posts.length === 0 
                ? 'Check back soon for updates and stories from our kitchen!'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </Card>
        ) : (
          <>
            {/* Featured Post */}
            {filteredPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <Card hover className="overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {filteredPosts[0].featuredImage && (
                      <div className="relative h-64 lg:h-auto">
                        <img
                          src={filteredPosts[0].featuredImage}
                          alt={filteredPosts[0].title}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handlePostClick(filteredPosts[0])}
                        />
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex px-3 py-1 bg-orange-600 text-white text-sm font-medium rounded-full">
                            Featured
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {filteredPosts[0].categories.map((category, idx) => (
                          <span key={idx} className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                      
                      <h2 
                        className="text-2xl font-bold text-gray-900 mb-4 cursor-pointer hover:text-orange-600"
                        onClick={() => handlePostClick(filteredPosts[0])}
                      >
                        {filteredPosts[0].title}
                      </h2>
                      
                      {filteredPosts[0].excerpt && (
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                          {filteredPosts[0].excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {filteredPosts[0].author}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(filteredPosts[0].publishedAt || filteredPosts[0].createdAt)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {getReadingTime(filteredPosts[0].content)} min read
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {filteredPosts[0].viewCount} views
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handlePostClick(filteredPosts[0])}
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          Read More
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Other Posts Grid */}
            {filteredPosts.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.slice(1).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 1) * 0.1 }}
                  >
                    <Card hover className="h-full overflow-hidden">
                      {post.featuredImage && (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-48 object-cover cursor-pointer"
                          onClick={() => handlePostClick(post)}
                        />
                      )}
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories.slice(0, 2).map((category, idx) => (
                            <span key={idx} className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {category}
                            </span>
                          ))}
                        </div>
                        
                        <h3 
                          className="text-lg font-semibold text-gray-900 mb-3 cursor-pointer hover:text-orange-600 line-clamp-2"
                          onClick={() => handlePostClick(post)}
                        >
                          {post.title}
                        </h3>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(post.publishedAt || post.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {post.viewCount}
                          </div>
                        </div>
                        
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePostClick(post)}
                          className="w-full"
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          Read More
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
