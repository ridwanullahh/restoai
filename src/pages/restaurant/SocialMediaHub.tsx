import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  Instagram, 
  Facebook, 
  Twitter, 
  Calendar, 
  Image,
  Video,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Send,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Target,
  Zap,
  Clock,
  Star,
  Camera
} from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Progress from '../../components/common/Progress';
import toast from 'react-hot-toast';

interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'all';
  content: string;
  media: string[];
  scheduledFor?: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  hashtags: string[];
  mentions: string[];
}

interface Campaign {
  id: string;
  name: string;
  type: 'promotion' | 'event' | 'seasonal' | 'brand';
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  posts: string[];
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  targetAudience: {
    ageRange: string;
    interests: string[];
    location: string;
  };
}

interface SocialMetrics {
  followers: {
    instagram: number;
    facebook: number;
    twitter: number;
    growth: number;
  };
  engagement: {
    rate: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  };
  reach: {
    weekly: number;
    monthly: number;
    growth: number;
  };
  topPosts: SocialPost[];
}

interface ContentTemplate {
  id: string;
  name: string;
  category: 'food' | 'event' | 'promotion' | 'behind-scenes' | 'customer';
  template: string;
  hashtags: string[];
  bestTimes: string[];
}

const SocialMediaHub: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [newPost, setNewPost] = useState({
    platform: 'all',
    content: '',
    scheduledFor: '',
    hashtags: '',
    media: [] as string[]
  });

  useEffect(() => {
    if (currentRestaurant) {
      loadSocialData();
    }
  }, [currentRestaurant]);

  const loadSocialData = async () => {
    try {
      setLoading(true);
      
      // Load social posts
      const postsData = await sdk.queryBuilder<SocialPost>('socialPosts')
        .where((post: any) => post.restaurantId === currentRestaurant?.id)
        .sort('publishedAt', 'desc')
        .exec();
      setPosts(postsData);

      // Load campaigns
      const campaignsData = await sdk.queryBuilder<Campaign>('campaigns')
        .where((campaign: any) => campaign.restaurantId === currentRestaurant?.id)
        .exec();
      setCampaigns(campaignsData);

      // Generate mock metrics
      const mockMetrics: SocialMetrics = {
        followers: {
          instagram: 2450,
          facebook: 1890,
          twitter: 1200,
          growth: 12.5
        },
        engagement: {
          rate: 4.2,
          totalLikes: 15600,
          totalComments: 890,
          totalShares: 340
        },
        reach: {
          weekly: 8900,
          monthly: 35600,
          growth: 18.3
        },
        topPosts: postsData.slice(0, 3)
      };
      setMetrics(mockMetrics);

      // Load content templates
      const templatesData: ContentTemplate[] = [
        {
          id: '1',
          name: 'New Dish Announcement',
          category: 'food',
          template: '🍽️ Introducing our latest creation: [DISH_NAME]! Made with [INGREDIENTS] and crafted with love. Come try it today! #NewDish #FreshFlavors',
          hashtags: ['#NewDish', '#FreshFlavors', '#ChefSpecial'],
          bestTimes: ['12:00', '18:00', '19:30']
        },
        {
          id: '2',
          name: 'Happy Hour Promotion',
          category: 'promotion',
          template: '🍻 Happy Hour is here! Join us from [START_TIME] to [END_TIME] for [DISCOUNT]% off drinks and appetizers. Perfect way to unwind! #HappyHour #Deals',
          hashtags: ['#HappyHour', '#Deals', '#Drinks'],
          bestTimes: ['16:00', '17:00']
        },
        {
          id: '3',
          name: 'Behind the Scenes',
          category: 'behind-scenes',
          template: '👨‍🍳 Take a peek behind the scenes! Our talented chef [CHEF_NAME] is preparing [DISH] with passion and precision. #BehindTheScenes #ChefLife',
          hashtags: ['#BehindTheScenes', '#ChefLife', '#Passion'],
          bestTimes: ['10:00', '15:00']
        },
        {
          id: '4',
          name: 'Customer Feature',
          category: 'customer',
          template: '😊 We love seeing happy faces! Thank you [CUSTOMER_NAME] for choosing us for your special celebration. We\'re honored to be part of your memories! #HappyCustomers #Memories',
          hashtags: ['#HappyCustomers', '#Memories', '#Grateful'],
          bestTimes: ['19:00', '20:00']
        }
      ];
      setTemplates(templatesData);

    } catch (error) {
      console.error('Failed to load social data:', error);
      toast.error('Failed to load social media data');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    try {
      const postData = {
        restaurantId: currentRestaurant?.id,
        platform: newPost.platform,
        content: newPost.content,
        scheduledFor: newPost.scheduledFor || undefined,
        status: newPost.scheduledFor ? 'scheduled' : 'published',
        hashtags: newPost.hashtags.split(' ').filter(tag => tag.startsWith('#')),
        media: newPost.media,
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          reach: 0
        },
        publishedAt: newPost.scheduledFor ? undefined : new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      await sdk.insert('socialPosts', postData);
      toast.success(newPost.scheduledFor ? 'Post scheduled successfully!' : 'Post published successfully!');
      
      setIsPostModalOpen(false);
      setNewPost({
        platform: 'all',
        content: '',
        scheduledFor: '',
        hashtags: '',
        media: []
      });
      
      await loadSocialData();
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    }
  };

  const useTemplate = (template: ContentTemplate) => {
    setNewPost(prev => ({
      ...prev,
      content: template.template,
      hashtags: template.hashtags.join(' ')
    }));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'twitter': return <Twitter className="w-5 h-5 text-blue-400" />;
      default: return <Share2 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'scheduled': return 'warning';
      case 'draft': return 'default';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Share2 className="w-8 h-8 text-blue-600 mr-3" />
            Social Media Hub
          </h1>
          <p className="text-gray-600">Manage your social presence and marketing campaigns</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setIsCampaignModalOpen(true)}
            icon={<Target className="w-5 h-5" />}
            variant="outline"
          >
            New Campaign
          </Button>
          <Button
            onClick={() => setIsPostModalOpen(true)}
            icon={<Plus className="w-5 h-5" />}
          >
            Create Post
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Followers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(metrics.followers.instagram + metrics.followers.facebook + metrics.followers.twitter)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{metrics.followers.growth}%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.engagement.rate}%</p>
                <p className="text-sm text-gray-500">{formatNumber(metrics.engagement.totalLikes)} likes</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Reach</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.reach.monthly)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{metrics.reach.growth}%</span>
                </div>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
                <p className="text-sm text-gray-500">{campaigns.length} total</p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {['posts', 'campaigns', 'analytics', 'templates'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="cursor-pointer" onClick={() => {
                setSelectedPost(post);
              }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(post.platform)}
                    <span className="text-sm font-medium capitalize">{post.platform}</span>
                  </div>
                  <Badge variant={getStatusColor(post.status)} size="sm">
                    {post.status}
                  </Badge>
                </div>

                {post.media.length > 0 && (
                  <div className="mb-4">
                    <img
                      src={post.media[0]}
                      alt="Post media"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{post.content}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {formatNumber(post.engagement.likes)}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {formatNumber(post.engagement.comments)}
                    </div>
                    <div className="flex items-center">
                      <Share2 className="w-4 h-4 mr-1" />
                      {formatNumber(post.engagement.shares)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {post.publishedAt 
                      ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                      : post.scheduledFor 
                        ? `Scheduled for ${new Date(post.scheduledFor).toLocaleDateString()}`
                        : 'Draft'
                    }
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" icon={<Edit className="w-4 h-4" />} />
                    <Button size="sm" variant="ghost" icon={<Eye className="w-4 h-4" />} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{campaign.type} campaign</p>
                  </div>
                  <Badge variant={getCampaignStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold">${campaign.budget.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Spent</p>
                    <p className="font-semibold">${campaign.spent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Impressions</p>
                    <p className="font-semibold">{formatNumber(campaign.metrics.impressions)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conversions</p>
                    <p className="font-semibold">{campaign.metrics.conversions}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Budget Used</span>
                    <span className="font-medium">{((campaign.spent / campaign.budget) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(campaign.spent / campaign.budget) * 100}
                    variant="default"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Instagram className="w-5 h-5 text-pink-600 mr-2" />
                    <span className="text-sm">Instagram</span>
                  </div>
                  <span className="font-semibold">{formatNumber(metrics.followers.instagram)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Facebook className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm">Facebook</span>
                  </div>
                  <span className="font-semibold">{formatNumber(metrics.followers.facebook)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Twitter className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-sm">Twitter</span>
                  </div>
                  <span className="font-semibold">{formatNumber(metrics.followers.twitter)}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Likes</span>
                  <span className="font-semibold">{formatNumber(metrics.engagement.totalLikes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Comments</span>
                  <span className="font-semibold">{formatNumber(metrics.engagement.totalComments)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Shares</span>
                  <span className="font-semibold">{formatNumber(metrics.engagement.totalShares)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement Rate</span>
                  <span className="font-semibold">{metrics.engagement.rate}%</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
              <div className="space-y-3">
                {metrics.topPosts.map((post, idx) => (
                  <div key={post.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {post.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatNumber(post.engagement.likes)} likes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <Badge variant="info" size="sm" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => useTemplate(template)}
                  >
                    Use Template
                  </Button>
                </div>

                <p className="text-gray-700 text-sm mb-4">{template.template}</p>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Suggested Hashtags:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.hashtags.map((hashtag, idx) => (
                        <Badge key={idx} variant="outline" size="sm">
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Best Times to Post:</p>
                    <div className="flex space-x-2">
                      {template.bestTimes.map((time, idx) => (
                        <Badge key={idx} variant="outline" size="sm">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="Create Social Media Post"
        size="lg"
      >
        <div className="space-y-6">
          <Select
            label="Platform"
            options={[
              { value: 'all', label: 'All Platforms' },
              { value: 'instagram', label: 'Instagram' },
              { value: 'facebook', label: 'Facebook' },
              { value: 'twitter', label: 'Twitter' }
            ]}
            value={newPost.platform}
            onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="What's happening at your restaurant?"
            />
          </div>

          <Input
            label="Hashtags"
            value={newPost.hashtags}
            onChange={(e) => setNewPost({ ...newPost, hashtags: e.target.value })}
            placeholder="#food #restaurant #delicious"
          />

          <Input
            label="Schedule For (Optional)"
            type="datetime-local"
            value={newPost.scheduledFor}
            onChange={(e) => setNewPost({ ...newPost, scheduledFor: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload images or videos</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsPostModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={createPost}>
              {newPost.scheduledFor ? 'Schedule Post' : 'Publish Now'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default SocialMediaHub;
