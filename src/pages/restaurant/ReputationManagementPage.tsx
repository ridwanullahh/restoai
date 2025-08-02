import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, MessageCircle, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import { ReputationMetric, Review } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

interface PlatformReview {
  id: string;
  platform: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  responded: boolean;
  response?: string;
}

const ReputationManagementPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [metrics, setMetrics] = useState<ReputationMetric[]>([]);
  const [reviews, setReviews] = useState<PlatformReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<PlatformReview | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    if (currentRestaurant) {
      loadData();
    }
  }, [currentRestaurant]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load reputation metrics
      const metricsData = await sdk.queryBuilder<ReputationMetric>('reputationMetrics')
        .where(metric => metric.restaurantId === currentRestaurant?.id)
        .sort('lastUpdated', 'desc')
        .exec();
      setMetrics(metricsData);
      
      // Load reviews from internal system
      const reviewsData = await sdk.queryBuilder<Review>('reviews')
        .where(review => review.restaurantId === currentRestaurant?.id)
        .sort('createdAt', 'desc')
        .limit(20)
        .exec();
      
      // Convert internal reviews to platform reviews format
      const platformReviews: PlatformReview[] = reviewsData.map(review => ({
        id: review.id,
        platform: 'internal',
        author: review.customerName,
        rating: review.rating,
        content: review.comment || '',
        date: review.createdAt,
        responded: !!review.response,
        response: review.response
      }));
      
      // In a real app, you would also fetch reviews from external platforms
      // For demo purposes, we'll add some mock external reviews
      const mockExternalReviews: PlatformReview[] = [
        {
          id: 'google-1',
          platform: 'google',
          author: 'John D.',
          rating: 5,
          content: 'Amazing food and great service! Will definitely come back.',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          responded: false
        },
        {
          id: 'yelp-1',
          platform: 'yelp',
          author: 'Sarah M.',
          rating: 4,
          content: 'Good food but the wait time was a bit long. Overall pleasant experience.',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          responded: true,
          response: 'Thank you for your feedback! We\'re working on reducing wait times.'
        },
        {
          id: 'tripadvisor-1',
          platform: 'tripadvisor',
          author: 'Mike R.',
          rating: 2,
          content: 'Food was cold when it arrived and service was slow.',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          responded: false
        }
      ];
      
      setReviews([...platformReviews, ...mockExternalReviews]);
      
    } catch (error) {
      console.error('Failed to load reputation data:', error);
      toast.error('Failed to load reputation data');
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    try {
      // In a real app, this would trigger API calls to external platforms
      toast.success('Metrics refreshed successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
      toast.error('Failed to refresh metrics');
    }
  };

  const handleRespondToReview = (review: PlatformReview) => {
    setSelectedReview(review);
    setResponseText(review.response || '');
    setIsResponseModalOpen(true);
  };

  const submitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;
    
    setSubmittingResponse(true);
    
    try {
      if (selectedReview.platform === 'internal') {
        // Update internal review
        await sdk.update('reviews', selectedReview.id, {
          response: responseText.trim(),
          updatedAt: new Date().toISOString()
        });
      } else {
        // In a real app, this would post to external platforms via their APIs
        console.log(`Responding to ${selectedReview.platform} review:`, responseText);
      }
      
      toast.success('Response submitted successfully!');
      setIsResponseModalOpen(false);
      setSelectedReview(null);
      setResponseText('');
      await loadData();
    } catch (error) {
      console.error('Failed to submit response:', error);
      toast.error('Failed to submit response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google': return '🔍';
      case 'yelp': return '🍽️';
      case 'tripadvisor': return '✈️';
      case 'facebook': return '📘';
      case 'internal': return '🏠';
      default: return '⭐';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'google': return 'bg-blue-100 text-blue-800';
      case 'yelp': return 'bg-red-100 text-red-800';
      case 'tripadvisor': return 'bg-green-100 text-green-800';
      case 'facebook': return 'bg-blue-100 text-blue-800';
      case 'internal': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const overallRating = metrics.length > 0 ? 
    metrics.reduce((sum, m) => sum + m.rating, 0) / metrics.length : 0;
  const totalReviews = metrics.reduce((sum, m) => sum + m.reviewCount, 0);
  const unrespondedReviews = reviews.filter(r => !r.responded).length;
  const lowRatingReviews = reviews.filter(r => r.rating <= 2).length;

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reputation Management</h1>
          <p className="text-gray-600">Monitor and manage your restaurant's online reputation across platforms.</p>
        </div>
        <Button
          onClick={refreshMetrics}
          icon={<RefreshCw className="w-5 h-5" />}
        >
          Refresh Metrics
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Rating</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{overallRating.toFixed(1)}</p>
                  <div className="flex">
                    {renderStars(Math.round(overallRating))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Needs Response</p>
                <p className="text-2xl font-bold text-gray-900">{unrespondedReviews}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Ratings</p>
                <p className="text-2xl font-bold text-gray-900">{lowRatingReviews}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Platform Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getPlatformIcon(metric.platform)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">{metric.platform}</h3>
                        <p className="text-sm text-gray-600">
                          Last updated: {formatDate(metric.lastUpdated)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ExternalLink className="w-4 h-4" />}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${getRatingColor(metric.rating)}`}>
                          {metric.rating.toFixed(1)}
                        </span>
                        <div className="flex">
                          {renderStars(Math.round(metric.rating))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reviews</span>
                      <span className="font-semibold text-gray-900">{metric.reviewCount}</span>
                    </div>
                    
                    {metric.trends.ratingChange !== 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Trend</span>
                        <div className="flex items-center space-x-1">
                          {metric.trends.ratingChange > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            metric.trends.ratingChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {metric.trends.ratingChange > 0 ? '+' : ''}{metric.trends.ratingChange.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reviews</h2>
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {review.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{review.author}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(review.platform)}`}>
                            {getPlatformIcon(review.platform)} {review.platform}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className={`font-semibold ${getRatingColor(review.rating)}`}>
                            {review.rating}/5
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{review.content}</p>
                        
                        {review.response && (
                          <div className="bg-gray-50 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">Your Response:</p>
                            <p className="text-sm text-gray-700">{review.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      {review.responded ? (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Responded
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Response
                        </span>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRespondToReview(review)}
                      icon={<MessageCircle className="w-4 h-4" />}
                    >
                      {review.responded ? 'Edit Response' : 'Respond'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={isResponseModalOpen}
        onClose={() => {
          setIsResponseModalOpen(false);
          setSelectedReview(null);
          setResponseText('');
        }}
        title={`Respond to ${selectedReview?.platform} Review`}
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-6">
            {/* Review Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="font-semibold text-gray-900">{selectedReview.author}</span>
                <div className="flex">
                  {renderStars(selectedReview.rating)}
                </div>
                <span className={`font-semibold ${getRatingColor(selectedReview.rating)}`}>
                  {selectedReview.rating}/5
                </span>
              </div>
              <p className="text-gray-700">{selectedReview.content}</p>
            </div>
            
            {/* Response Form */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={6}
                placeholder="Write a professional response to this review..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Be professional, acknowledge their feedback, and show how you're addressing any concerns.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsResponseModalOpen(false);
                  setSelectedReview(null);
                  setResponseText('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={submitResponse}
                disabled={!responseText.trim() || submittingResponse}
              >
                {submittingResponse ? 'Submitting...' : 'Submit Response'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default ReputationManagementPage;
