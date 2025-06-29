import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, ThumbsUp, Search, Filter, Reply, Send } from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { sdk, ai } from '../lib/config';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  uid: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment?: string;
  reviewDate: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  response?: {
    message: string;
    date: string;
    author: string;
  };
  verified: boolean;
  helpful: number;
}

const ReviewsPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  const ratingOptions = ['all', '5', '4', '3', '2', '1'];
  const sentimentOptions = ['all', 'positive', 'neutral', 'negative'];

  useEffect(() => {
    if (currentRestaurant) {
      loadReviews();
    }
  }, [currentRestaurant]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviewData = await sdk.queryBuilder<Review>('reviews')
        .where(review => review.restaurantId === currentRestaurant?.id)
        .sort('reviewDate', 'desc')
        .exec();
      setReviews(reviewData);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = async (review: Review) => {
    try {
      setIsGeneratingResponse(true);
      const restaurantContext = {
        name: currentRestaurant?.name,
        cuisine: currentRestaurant?.cuisine,
        description: currentRestaurant?.description
      };

      const prompt = `Generate a professional, empathetic response to this customer review:
      
      Rating: ${review.rating}/5 stars
      Comment: "${review.comment}"
      Customer: ${review.customerName}
      
      Restaurant: ${restaurantContext.name}
      Cuisine: ${restaurantContext.cuisine}
      
      Guidelines:
      - Be professional and courteous
      - Thank the customer for their feedback
      - Address specific points mentioned in the review
      - ${review.rating >= 4 ? 'Express gratitude and invite them back' : 'Acknowledge concerns and offer to make things right'}
      - Keep it concise but personal
      - Include the restaurant name naturally`;

      const response = await ai.generateChatbotResponse(prompt, restaurantContext);
      setResponseText(response);
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      toast.error('Failed to generate response');
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const submitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    try {
      await sdk.update('reviews', selectedReview.id, {
        response: {
          message: responseText,
          date: new Date().toISOString(),
          author: 'Restaurant Owner'
        }
      });

      toast.success('Response submitted successfully!');
      setIsResponseModalOpen(false);
      setResponseText('');
      setSelectedReview(null);
      await loadReviews();
    } catch (error) {
      console.error('Failed to submit response:', error);
      toast.error('Failed to submit response');
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    const matchesSentiment = sentimentFilter === 'all' || review.sentiment === sentimentFilter;
    
    return matchesSearch && matchesRating && matchesSentiment;
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reviews & Feedback</h1>
          <p className="text-gray-600">Manage customer reviews and respond to feedback</p>
        </div>
      </div>

      {/* Review Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRating), 'md')}
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="text-xs text-gray-500">{reviews.length} total reviews</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
          <div className="space-y-3">
            {['positive', 'neutral', 'negative'].map(sentiment => {
              const count = reviews.filter(r => r.sentiment === sentiment).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={sentiment} className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(sentiment)}`}>
                    {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                  </span>
                  <span className="text-sm text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {ratingOptions.map(rating => (
                  <option key={rating} value={rating}>
                    {rating === 'all' ? 'All Ratings' : `${rating} Stars`}
                  </option>
                ))}
              </select>
            </div>
            
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {sentimentOptions.map(sentiment => (
                <option key={sentiment} value={sentiment}>
                  {sentiment === 'all' ? 'All Sentiments' : sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">
                      {review.customerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{review.customerName}</h3>
                      {review.verified && (
                        <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">{formatDate(review.reviewDate)}</span>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(review.sentiment)}`}>
                      {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {review.helpful > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{review.helpful}</span>
                    </div>
                  )}
                  {!review.response && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review);
                        setIsResponseModalOpen(true);
                      }}
                      icon={<Reply className="w-4 h-4" />}
                    >
                      Respond
                    </Button>
                  )}
                </div>
              </div>
              
              {review.comment && (
                <div className="mb-4">
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              )}
              
              {review.response && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-900">Response from {review.response.author}</span>
                    <span className="text-xs text-gray-500">{formatDate(review.response.date)}</span>
                  </div>
                  <p className="text-gray-700">{review.response.message}</p>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No reviews found matching your criteria.</p>
        </div>
      )}

      {/* Response Modal */}
      <Modal
        isOpen={isResponseModalOpen}
        onClose={() => {
          setIsResponseModalOpen(false);
          setResponseText('');
          setSelectedReview(null);
        }}
        title="Respond to Review"
        size="lg"
      >
        {selectedReview && (
          <div className="p-6">
            {/* Review Summary */}
            <Card className="mb-6 bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {selectedReview.customerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{selectedReview.customerName}</h3>
                    {renderStars(selectedReview.rating)}
                  </div>
                  {selectedReview.comment && (
                    <p className="text-gray-700 text-sm">{selectedReview.comment}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Response Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Your Response
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIResponse(selectedReview)}
                  loading={isGeneratingResponse}
                >
                  Generate AI Response
                </Button>
              </div>
              
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Write your response to this review..."
              />
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResponseModalOpen(false);
                    setResponseText('');
                    setSelectedReview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitResponse}
                  disabled={!responseText.trim()}
                  icon={<Send className="w-4 h-4" />}
                >
                  Send Response
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default ReviewsPage;