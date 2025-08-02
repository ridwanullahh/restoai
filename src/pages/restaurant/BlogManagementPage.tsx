import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Calendar, Tag, Search, Filter } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useAuth } from '../../contexts/AuthContext';
import { sdk } from '../../lib/config';
import { BlogPost } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

const BlogManagementPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    publishedAt: '',
    tags: [] as string[],
    categories: [] as string[],
    seoTitle: '',
    seoDescription: '',
    commentsEnabled: true
  });
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (currentRestaurant) {
      loadPosts();
    }
  }, [currentRestaurant]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await sdk.queryBuilder<BlogPost>('blogPosts')
        .where(post => post.restaurantId === currentRestaurant?.id)
        .sort('createdAt', 'desc')
        .exec();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featuredImage: '',
      status: 'draft',
      publishedAt: '',
      tags: [],
      categories: [],
      seoTitle: '',
      seoDescription: '',
      commentsEnabled: true
    });
    setEditingPost(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant || !user) return;

    try {
      const postData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        author: user.name || user.email,
        publishedAt: formData.status === 'published' && !formData.publishedAt ? 
          new Date().toISOString() : formData.publishedAt
      };

      if (editingPost) {
        await sdk.update('blogPosts', editingPost.id, {
          ...postData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Blog post updated successfully!');
      } else {
        await sdk.insert<BlogPost>('blogPosts', {
          ...postData,
          restaurantId: currentRestaurant.id
        });
        toast.success('Blog post created successfully!');
      }
      
      setIsAddModalOpen(false);
      resetForm();
      await loadPosts();
    } catch (error) {
      console.error('Failed to save blog post:', error);
      toast.error('Failed to save blog post');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featuredImage: post.featuredImage || '',
      status: post.status,
      publishedAt: post.publishedAt || '',
      tags: post.tags,
      categories: post.categories,
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      commentsEnabled: post.commentsEnabled
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;

    try {
      await sdk.delete('blogPosts', post.id);
      toast.success('Blog post deleted successfully!');
      await loadPosts();
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  const handlePublish = async (post: BlogPost) => {
    try {
      await sdk.update('blogPosts', post.id, {
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast.success('Blog post published successfully!');
      await loadPosts();
    } catch (error) {
      console.error('Failed to publish blog post:', error);
      toast.error('Failed to publish blog post');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory.trim()]
      });
      setNewCategory('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter(cat => cat !== categoryToRemove)
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Management</h1>
          <p className="text-gray-600">Create and manage blog posts for your restaurant.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Edit className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-600 mb-4">Start sharing your restaurant's story with your first blog post.</p>
          <Button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            icon={<Plus className="w-5 h-5" />}
          >
            Create First Post
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                      </div>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 mb-3">{post.excerpt}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {post.publishedAt ? 
                            new Date(post.publishedAt).toLocaleDateString() : 
                            new Date(post.createdAt).toLocaleDateString()
                          }
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {post.viewCount} views
                        </div>
                        <div>By {post.author}</div>
                      </div>
                      
                      {(post.tags.length > 0 || post.categories.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories.map((category, idx) => (
                            <span key={idx} className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {category}
                            </span>
                          ))}
                          {post.tags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {post.featuredImage && (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-24 h-24 object-cover rounded-lg ml-4"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {post.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublish(post)}
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/${currentRestaurant?.slug}/blog/${post.slug}`, '_blank')}
                        icon={<Eye className="w-4 h-4" />}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(post)}
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post)}
                        icon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Post Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData({ 
                  ...formData, 
                  title,
                  slug: generateSlug(title)
                });
              }}
              required
              placeholder="Enter post title..."
            />
            
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="url-friendly-slug"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={10}
              required
              placeholder="Write your blog post content here..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Brief summary of the post..."
            />
          </div>
          
          <Input
            label="Featured Image URL"
            type="url"
            value={formData.featuredImage}
            onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <Input
              label="Publish Date"
              type="datetime-local"
              value={formData.publishedAt}
              onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
            />
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Add tag..."
              />
              <Button
                type="button"
                onClick={addTag}
                className="rounded-l-none"
              >
                Add
              </Button>
            </div>
          </div>
          
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.categories.map((category, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Add category..."
              />
              <Button
                type="button"
                onClick={addCategory}
                className="rounded-l-none"
              >
                Add
              </Button>
            </div>
          </div>
          
          {/* SEO */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <Input
                label="SEO Title"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder="SEO optimized title..."
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={2}
                  placeholder="SEO meta description..."
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="commentsEnabled"
              checked={formData.commentsEnabled}
              onChange={(e) => setFormData({ ...formData, commentsEnabled: e.target.checked })}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="commentsEnabled" className="ml-2 block text-sm text-gray-900">
              Enable comments on this post
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default BlogManagementPage;
