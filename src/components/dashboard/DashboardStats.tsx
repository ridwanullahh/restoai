import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Star } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../common/Card';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon, color, loading }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </p>
          <div className="flex items-center mt-2">
            <TrendIcon className={`w-4 h-4 ${trendColor} mr-1`} />
            <span className={`text-sm font-medium ${trendColor}`}>{change}</span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const DashboardStats: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant) {
      loadStats();
    }
  }, [currentRestaurant]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get last 30 days data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch orders
      const orders = await sdk.queryBuilder('orders')
        .where((order: any) => 
          order.restaurantId === currentRestaurant?.id &&
          new Date(order.orderDate) >= thirtyDaysAgo
        )
        .exec();

      // Fetch reviews
      const reviews = await sdk.queryBuilder('reviews')
        .where((review: any) => review.restaurantId === currentRestaurant?.id)
        .exec();

      // Calculate stats
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
      const totalOrders = orders.length;
      const uniqueCustomers = new Set(orders.map((order: any) => order.customerId)).size;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
        : 0;

      setStats({
        revenue: totalRevenue,
        orders: totalOrders,
        customers: uniqueCustomers,
        rating: averageRating
      });

    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: 'Total Revenue',
      value: `$${stats.revenue.toFixed(2)}`,
      change: '+12.5%',
      trend: 'up' as const,
      icon: <DollarSign className="w-6 h-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Orders Today',
      value: stats.orders.toString(),
      change: '+8.3%',
      trend: 'up' as const,
      icon: <ShoppingBag className="w-6 h-6 text-white" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Customers',
      value: stats.customers.toString(),
      change: '+15.2%',
      trend: 'up' as const,
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Average Rating',
      value: stats.rating.toFixed(1),
      change: stats.rating >= 4.5 ? '+2.1%' : '-2.1%',
      trend: stats.rating >= 4.5 ? 'up' as const : 'down' as const,
      icon: <Star className="w-6 h-6 text-white" />,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard {...stat} loading={loading} />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;