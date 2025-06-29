import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, Filter, Edit, Trash2, Plus } from 'lucide-react';
import { useCustomer } from '../../contexts/CustomerContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const CustomerReviews: React.FC = () => {
  const { reviews, submitReview } = useCustomer();
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [formData, setFormData] = useState({
    restaurantId: '',
    rating: 5,
    comment: ''
  });

  const ratingOptions = ['all', '5', '4', '3', '2', '1'];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitReview({
        restaurantId: formData.restaurantId,
        rating: formData.rating,
        comment: formData.comment
      });
      
      setIsAddModalOpen(false);
      setFormData({ restaurantId: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Reviews</h1>
          <p className="text-gray-600">Manage your restaurant reviews and ratings</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          Write Review
        </Button>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{reviews.length}</div>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : '0.0'
              }
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(reviews.length > 0 
                ? Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                : 0
              )}
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {reviews.filter(r => r.helpful > 0).length}
            </div>
            <p className="text-sm text-gray-600">Helpful Reviews</p>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ratingOptions.map(rating => (
                  <option key={rating} value={rating}>
                    {rating === 'all' ? 'All Ratings' : `${rating} Stars`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reviews found</p>
            </div>
          </Card>
        ) : (
          filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Restaurant Review</h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingReview(review);
                        setFormData({
                          restaurantId: review.restaurantId,
                          rating: review.rating,
                          comment: review.comment || ''
                        });
                        setIsAddModalOpen(true);
                      }}
                      icon={<Edit className="w-4 h-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                </div>
                
                {review.comment && (
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    {review.verified && (
                      <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Verified
                      </span>
                    )}
                    {review.helpful > 0 && (
                      <span>{review.helpful} people found this helpful</span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Review Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingReview(null);
          setFormData({ restaurantId: '', rating: 5, comment: '' });
        }}
        title={editingReview ? 'Edit Review' : 'Write a Review'}
        size="lg"
      >
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant
              </label>
              <input
                type="text"
                value={formData.restaurantId}
                onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Restaurant name or ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              {renderStars(formData.rating, true, (rating) => 
                setFormData(prev => ({ ...prev, rating }))
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your experience..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingReview(null);
                  setFormData({ restaurantId: '', rating: 5, comment: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingReview ? 'Update Review' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CustomerReviews;