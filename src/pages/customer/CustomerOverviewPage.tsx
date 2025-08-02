import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Calendar, 
  Star, 
  Gift, 
  TrendingUp, 
  Clock,
  DollarSign,
  Heart,
  Award,
  ChevronRight
} from 'lucide-react';
import { sdk } from '../../lib/config';
import { Customer, Order, Reservation, Review } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Progress from '../../components/common/Progress';
import { SkeletonCard } from '../../components/common/Skeleton';

interface CustomerOverviewPageProps {
  customer: Customer | null;
  stats: {
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    upcomingReservations: number;
    favoriteItems: number;
    pendingReviews: number;
  };
}

const CustomerOverviewPage: React.FC<CustomerOverviewPageProps> = ({ customer, stats }) => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer) {
      loadRecentActivity();
    }
  }, [customer]);

  const loadRecentActivity = async () => {
    try {
      setLoading(true);

      // Load recent orders with more details
      const orders = await sdk.queryBuilder<Order>('orders')
        .where(o => o.customerId === customer?.id)
        .sort('orderDate', 'desc')
        .limit(5)
        .exec();
      setRecentOrders(orders);

      // Load upcoming reservations with more filtering
      const reservations = await sdk.queryBuilder<Reservation>('reservations')
        .where(r => r.customerInfo.email === customer?.email && r.status !== 'cancelled')
        .sort('date', 'asc')
        .exec();

      const now = new Date();
      const upcoming = reservations.filter(r => {
        const reservationDate = new Date(`${r.date}T${r.time}`);
        return reservationDate >= now && r.status !== 'completed';
      }).slice(0, 3);

      setUpcomingReservations(upcoming);

    } catch (error) {
      console.error('Failed to load recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerTier = () => {
    if (stats.totalSpent >= 500) return { name: 'VIP', color: 'bg-purple-100 text-purple-800', progress: 100 };
    if (stats.totalSpent >= 200) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-800', progress: (stats.totalSpent / 500) * 100 };
    if (stats.totalSpent >= 50) return { name: 'Silver', color: 'bg-gray-100 text-gray-800', progress: (stats.totalSpent / 200) * 100 };
    return { name: 'Bronze', color: 'bg-orange-100 text-orange-800', progress: (stats.totalSpent / 50) * 100 };
  };

  const getNextTierAmount = () => {
    if (stats.totalSpent >= 500) return 0;
    if (stats.totalSpent >= 200) return 500 - stats.totalSpent;
    if (stats.totalSpent >= 50) return 200 - stats.totalSpent;
    return 50 - stats.totalSpent;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const tier = getCustomerTier();
  const nextTierAmount = getNextTierAmount();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {customer?.name || 'Valued Customer'}!
        </h1>
        <p className="text-orange-100">
          Here's what's happening with your account
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                <p className="text-2xl font-bold text-gray-900">{stats.loyaltyPoints}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Reservations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingReservations}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Tier & Progress */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Status</h2>
            <Badge className={tier.color}>
              <Award className="w-4 h-4 mr-1" />
              {tier.name}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <Progress 
              value={tier.progress} 
              variant="default" 
              showLabel 
              label={`Progress to ${tier.name === 'VIP' ? 'VIP (Achieved!)' : 'next tier'}`}
              animated
            />
            
            {nextTierAmount > 0 && (
              <p className="text-sm text-gray-600">
                Spend ${nextTierAmount.toFixed(2)} more to reach the next tier!
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link to={`/${restaurantSlug}/dashboard/orders`}>
                <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
                  View All
                </Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders yet</p>
                <Link to={`/${restaurantSlug}/menu`}>
                  <Button className="mt-2">Browse Menu</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                      <p className="text-sm text-gray-600">{order.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                      <Badge 
                        variant={order.status === 'delivered' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Reservations */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Reservations</h2>
              <Link to={`/${restaurantSlug}/dashboard/reservations`}>
                <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
                  View All
                </Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : upcomingReservations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming reservations</p>
                <Link to={`/${restaurantSlug}/reservations`}>
                  <Button className="mt-2">Make Reservation</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(reservation.date)} at {formatTime(reservation.time)}
                      </p>
                      <p className="text-sm text-gray-600">{reservation.partySize} guests</p>
                      <p className="text-sm text-gray-600">Code: {reservation.confirmationCode}</p>
                    </div>
                    <Badge 
                      variant={reservation.status === 'confirmed' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {reservation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to={`/${restaurantSlug}/menu`}>
              <Button variant="outline" className="w-full h-20 flex-col">
                <ShoppingBag className="w-6 h-6 mb-2" />
                Order Food
              </Button>
            </Link>
            
            <Link to={`/${restaurantSlug}/reservations`}>
              <Button variant="outline" className="w-full h-20 flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                Book Table
              </Button>
            </Link>
            
            <Link to={`/${restaurantSlug}/dashboard/favorites`}>
              <Button variant="outline" className="w-full h-20 flex-col">
                <Heart className="w-6 h-6 mb-2" />
                Favorites
              </Button>
            </Link>
            
            <Link to={`/${restaurantSlug}/dashboard/loyalty`}>
              <Button variant="outline" className="w-full h-20 flex-col">
                <Gift className="w-6 h-6 mb-2" />
                Rewards
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CustomerOverviewPage;
