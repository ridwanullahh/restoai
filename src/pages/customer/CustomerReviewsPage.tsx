import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Calendar } from 'lucide-react';
import { sdk } from '../../lib/config';
import { Customer, Review, Order } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { SkeletonList } from '../../components/common/Skeleton';

interface CustomerReviewsPageProps {
  customer: Customer | null;
}

const CustomerReviewsPage: React.FC<CustomerReviewsPageProps> = ({ customer }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer) {
      loadReviews();
    }
  }, [customer]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      // Load existing reviews
      const reviewsData = await sdk.queryBuilder<Review>('reviews')
        .where(r => r.customerEmail === customer?.email)
        .sort('createdAt', 'desc')
        .exec();
      setReviews(reviewsData);
      
      // Load orders that can be reviewed
      const orders = await sdk.queryBuilder<Order>('orders')
        .where(o => o.customerId === customer?.id && o.status === 'delivered')
        .exec();
      
      const pendingReviews = orders.filter(order => 
        !reviewsData.some(review => review.orderId === order.id)
      );
      setPendingOrders(pendingReviews);
      
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
        <SkeletonList items={5} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
        <p className="text-gray-600">Share your dining experiences</p>
      </div>

      {/* Pending Reviews */}
      {pendingOrders.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Reviews ({pendingOrders.length})
            </h2>
            <div className="space-y-4">
              {pendingOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm">Write Review</Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Existing Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Order some food and share your experience!</p>
          </Card>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Order #{review.orderId?.slice(-6)}</h3>
                    </div>
                    <Badge variant="success">Published</Badge>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                  )}
                  
                  {review.response && (
                    <div className="bg-orange-50 border-l-4 border-orange-200 p-4">
                      <p className="text-sm font-medium text-orange-800 mb-1">Restaurant Response:</p>
                      <p className="text-sm text-orange-700">{review.response}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default CustomerReviewsPage;
