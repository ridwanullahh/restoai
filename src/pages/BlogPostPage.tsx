import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Eye, Tag, Clock, Share2, Heart, MessageCircle } from 'lucide-react';
import { sdk } from '../lib/config';
import { BlogPost, BlogComment, Restaurant } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const BlogPostPage: React.FC = () => {
  const { restaurantSlug, postSlug } = useParams<{ restaurantSlug: string; postSlug: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    author: '',
    email: '',
    content: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (restaurantSlug && postSlug) {
      loadData();
    }
  }, [restaurantSlug, postSlug]);

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
      
      // Load blog post
      const posts = await sdk.queryBuilder<BlogPost>('blogPosts')
        .where(p => p.slug === postSlug && p.restaurantId === restaurants[0].id && p.status === 'published')
        .exec();
      
      if (posts.length === 0) {
        navigate(`/${restaurantSlug}/blog`);
        return;
      }
      
      const currentPost = posts[0];
      setPost(currentPost);
      
      // Increment view count
      await sdk.update('blogPosts', currentPost.id, {
        viewCount: currentPost.viewCount + 1,
        updatedAt: new Date().toISOString()
      });
      
      // Load comments
      if (currentPost.commentsEnabled) {
        const postComments = await sdk.queryBuilder<BlogComment>('blogComments')
          .where(c => c.postId === currentPost.id && c.status === 'approved')
          .sort('createdAt', 'desc')
          .exec();
        setComments(postComments);
      }
      
      // Load related posts
      const allPosts = await sdk.queryBuilder<BlogPost>('blogPosts')
        .where(p => p.restaurantId === restaurants[0].id && p.status === 'published' && p.id !== currentPost.id)
        .sort('publishedAt', 'desc')
        .limit(3)
        .exec();
      
      // Filter related posts by shared categories or tags
      const related = allPosts.filter(p => 
        p.categories.some(cat => currentPost.categories.includes(cat)) ||
        p.tags.some(tag => currentPost.tags.includes(tag))
      ).slice(0, 3);
      
      setRelatedPosts(related.length > 0 ? related : allPosts.slice(0, 3));
      
    } catch (error) {
      console.error('Failed to load blog post:', error);
      navigate(`/${restaurantSlug}/blog`);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentForm.author.trim() || !commentForm.email.trim() || !commentForm.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmittingComment(true);
    
    try {
      await sdk.insert<BlogComment>('blogComments', {
        postId: post.id,
        author: commentForm.author.trim(),
        email: commentForm.email.trim(),
        content: commentForm.content.trim(),
        status: 'pending' // Comments need approval
      });
      
      setCommentForm({ author: '', email: '', content: '' });
      toast.success('Comment submitted! It will appear after approval.');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      toast.error('Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
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

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const formatContent = (content: string) => {
    // Simple content formatting - convert line breaks to paragraphs
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-4">The blog post you're looking for doesn't exist.</p>
          <Link to={`/${restaurantSlug}/blog`}>
            <Button>Back to Blog</Button>
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
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/${restaurantSlug}/blog`)}
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back to Blog
              </Button>
              <div>
                <Link to={`/${restaurantSlug}`} className="text-xl font-bold text-gray-900 hover:text-orange-600">
                  {restaurant.name}
                </Link>
                <p className="text-sm text-gray-600">Blog</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleShare}
                icon={<Share2 className="w-4 h-4" />}
              >
                Share
              </Button>
              <Link to={`/${restaurantSlug}/menu`}>
                <Button>View Menu</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((category, idx) => (
              <span key={idx} className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {category}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              <span>By {post.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span>{getReadingTime(post.content)} min read</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              <span>{post.viewCount + 1} views</span>
            </div>
          </div>
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Featured Image */}
        {post.featuredImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </motion.div>
        )}

        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none mb-12"
        >
          <div className="text-gray-800 text-lg leading-relaxed">
            {formatContent(post.content)}
          </div>
        </motion.div>

        {/* Social Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between py-6 border-t border-b border-gray-200 mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              icon={<Heart className="w-4 h-4" />}
            >
              Like
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              icon={<Share2 className="w-4 h-4" />}
            >
              Share
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            Published on {formatDate(post.publishedAt || post.createdAt)}
          </div>
        </motion.div>

        {/* Comments Section */}
        {post.commentsEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2" />
              Comments ({comments.length})
            </h3>
            
            {/* Comment Form */}
            <Card className="mb-8">
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Leave a Comment</h4>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={commentForm.author}
                      onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={commentForm.email}
                      onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Your comment..."
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={submittingComment}
                      icon={<MessageCircle className="w-4 h-4" />}
                    >
                      {submittingComment ? 'Submitting...' : 'Post Comment'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
            
            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-semibold">
                              {comment.author.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{comment.author}</h5>
                            <p className="text-sm text-gray-500">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card hover className="h-full">
                    <Link to={`/${restaurantSlug}/blog/${relatedPost.slug}`}>
                      {relatedPost.featuredImage && (
                        <img
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        {relatedPost.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {relatedPost.excerpt}
                          </p>
                        )}
                        <div className="flex items-center mt-3 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(relatedPost.publishedAt || relatedPost.createdAt)}
                        </div>
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </article>
    </div>
  );
};

export default BlogPostPage;
