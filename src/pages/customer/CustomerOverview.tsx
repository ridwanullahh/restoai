import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Heart, Gift, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { useCustomer } from '../../contexts/CustomerContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  rating: number;
  coverImage: string;
}

const CustomerOverview: React.FC = () => {
  const { customer, orders, reviews, loyaltyPoints } = useCustomer();
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [customer]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load favorite restaurants
      if (customer?.favoriteRestaurants?.length > 0) {
        const restaurants = await sdk.queryBuilder<Restaurant>('restaurants')
          .where(r => customer.favoriteRestaurants.includes(r.id))
          .exec();
        setFavoriteRestaurants(restaurants);
      }

      // Get recent orders
      setRecentOrders(orders.slice(0, 3));
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const customerStats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    averageRating: reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0,
    favoriteCount: favoriteRestaurants.length
  };

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {customer?.name || 'Food Lover'}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your dining experience</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{customerStats.totalOrders}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${customerStats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
              <p className="text-2xl font-bold text-gray-900">{loyaltyPoints}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating Given</p>
              <p className="text-2xl font-bold text-gray-900">{customerStats.averageRating.toFixed(1)}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent orders</p>
                </div>
              ) : (
                recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {order.items.length} items • ${order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Favorite Restaurants */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Favorite Restaurants</h2>
              <Button variant="outline" size="sm">
                Explore More
              </Button>
            </div>

            <div className="space-y-4">
              {favoriteRestaurants.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No favorite restaurants yet</p>
                </div>
              ) : (
                favoriteRestaurants.map((restaurant, index) => (
                  <motion.div
                    key={restaurant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <img
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{restaurant.name}</p>
                      <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{restaurant.rating}</span>
                      </div>
                    </div>
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <ShoppingBag className="w-6 h-6" />
              <span>Browse Restaurants</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Star className="w-6 h-6" />
              <span>Write a Review</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Gift className="w-6 h-6" />
              <span>Redeem Points</span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CustomerOverview;