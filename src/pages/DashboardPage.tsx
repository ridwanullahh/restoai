import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Star,
  Users,
  ShoppingBag,
  Calendar,
  MessageCircle,
  Package,
  DollarSign,
  ChevronRight,
  Bell,
  CheckCircle
} from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { sdk } from '../lib/config';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentOrders from '../components/dashboard/RecentOrders';
import RevenueChart from '../components/dashboard/RevenueChart';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Progress from '../components/common/Progress';

interface DashboardAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    link: string;
  };
}

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

const DashboardPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [todayStats, setTodayStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    newReviews: 0,
    upcomingReservations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant) {
      loadDashboardData();
    }
  }, [currentRestaurant]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      // Load today's orders
      const todayOrders = await sdk.queryBuilder('orders')
        .where((order: any) =>
          order.restaurantId === currentRestaurant?.id &&
          new Date(order.orderDate) >= todayStart
        )
        .exec();

      // Load yesterday's orders for comparison
      const yesterdayOrders = await sdk.queryBuilder('orders')
        .where((order: any) =>
          order.restaurantId === currentRestaurant?.id &&
          new Date(order.orderDate) >= yesterdayStart &&
          new Date(order.orderDate) < todayStart
        )
        .exec();

      // Load pending orders
      const pendingOrders = await sdk.queryBuilder('orders')
        .where((order: any) =>
          order.restaurantId === currentRestaurant?.id &&
          ['pending', 'confirmed', 'preparing'].includes(order.status)
        )
        .exec();

      // Load inventory for low stock alerts
      const inventory = await sdk.queryBuilder('inventory')
        .where((item: any) => item.restaurantId === currentRestaurant?.id)
        .exec();

      // Load recent reviews
      const recentReviews = await sdk.queryBuilder('reviews')
        .where((review: any) =>
          review.restaurantId === currentRestaurant?.id &&
          new Date(review.reviewDate) >= todayStart
        )
        .exec();

      // Load today's reservations
      const todayReservations = await sdk.queryBuilder('reservations')
        .where((reservation: any) =>
          reservation.restaurantId === currentRestaurant?.id &&
          reservation.date === today.toISOString().split('T')[0] &&
          reservation.status !== 'cancelled'
        )
        .exec();

      // Calculate stats
      const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + order.total, 0);
      const yesterdayRevenue = yesterdayOrders.reduce((sum: number, order: any) => sum + order.total, 0);
      const lowStockItems = inventory.filter((item: any) => item.currentStock <= item.minStock);

      // Calculate percentage changes
      const orderChange = yesterdayOrders.length > 0
        ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length * 100).toFixed(1)
        : '0';
      const revenueChange = yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
        : '0';

      setTodayStats({
        ordersToday: todayOrders.length,
        revenueToday: todayRevenue,
        pendingOrders: pendingOrders.length,
        lowStockItems: lowStockItems.length,
        newReviews: recentReviews.length,
        upcomingReservations: todayReservations.length
      });

      // Set quick stats
      setQuickStats([
        {
          label: 'Orders Today',
          value: todayOrders.length.toString(),
          change: `${orderChange}%`,
          trend: parseFloat(orderChange) >= 0 ? 'up' : 'down',
          icon: <ShoppingBag className="w-5 h-5" />,
          color: 'text-blue-600'
        },
        {
          label: 'Revenue Today',
          value: `$${todayRevenue.toFixed(2)}`,
          change: `${revenueChange}%`,
          trend: parseFloat(revenueChange) >= 0 ? 'up' : 'down',
          icon: <DollarSign className="w-5 h-5" />,
          color: 'text-green-600'
        },
        {
          label: 'Avg Order Value',
          value: todayOrders.length > 0 ? `$${(todayRevenue / todayOrders.length).toFixed(2)}` : '$0',
          change: '+5.2%',
          trend: 'up',
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'text-purple-600'
        },
        {
          label: 'Customer Satisfaction',
          value: recentReviews.length > 0
            ? `${(recentReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / recentReviews.length).toFixed(1)}/5`
            : 'N/A',
          change: '+0.3',
          trend: 'up',
          icon: <Star className="w-5 h-5" />,
          color: 'text-yellow-600'
        }
      ]);

      // Generate alerts
      const newAlerts: DashboardAlert[] = [];

      if (pendingOrders.length > 5) {
        newAlerts.push({
          id: 'pending-orders',
          type: 'warning',
          title: 'High Order Volume',
          message: `You have ${pendingOrders.length} pending orders that need attention.`,
          action: { label: 'View Orders', link: '/orders' }
        });
      }

      if (lowStockItems.length > 0) {
        newAlerts.push({
          id: 'low-stock',
          type: 'error',
          title: 'Low Stock Alert',
          message: `${lowStockItems.length} items are running low on stock.`,
          action: { label: 'Manage Inventory', link: '/inventory' }
        });
      }

      if (recentReviews.some((r: any) => r.rating <= 2)) {
        newAlerts.push({
          id: 'negative-reviews',
          type: 'warning',
          title: 'Negative Reviews',
          message: 'You have new negative reviews that may need responses.',
          action: { label: 'View Reviews', link: '/reviews' }
        });
      }

      if (todayReservations.length > 10) {
        newAlerts.push({
          id: 'busy-day',
          type: 'info',
          title: 'Busy Day Ahead',
          message: `You have ${todayReservations.length} reservations today. Prepare for a busy service!`,
          action: { label: 'View Reservations', link: '/reservations' }
        });
      }

      setAlerts(newAlerts);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info': return <Bell className="w-5 h-5 text-blue-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {currentRestaurant?.name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your restaurant today - {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 border rounded-lg ${getAlertBgColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                  </div>
                  {alert.action && (
                    <Link to={alert.action.link}>
                      <Button variant="outline" size="sm">
                        {alert.action.label}
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`w-4 h-4 mr-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Stats */}
      <DashboardStats />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueChart />
        <RecentOrders />
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Activity</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Orders</span>
              <Badge variant={todayStats.pendingOrders > 5 ? 'warning' : 'default'}>
                {todayStats.pendingOrders}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Upcoming Reservations</span>
              <Badge variant="info">{todayStats.upcomingReservations}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Reviews</span>
              <Badge variant="success">{todayStats.newReviews}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Stock Items</span>
              <Badge variant={todayStats.lowStockItems > 0 ? 'error' : 'success'}>
                {todayStats.lowStockItems}
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Daily Goal Progress</span>
                <span className="font-medium">75%</span>
              </div>
              <Progress value={75} variant="default" animated />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} variant="success" animated />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Order Fulfillment</span>
                <span className="font-medium">88%</span>
              </div>
              <Progress value={88} variant="warning" animated />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <Link to="/menu">
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                Manage Menu
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingBag className="w-4 h-4 mr-2" />
                View Orders
              </Button>
            </Link>
            <Link to="/reservations">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Reservations
              </Button>
            </Link>
            <Link to="/reviews">
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="w-4 h-4 mr-2" />
                Customer Reviews
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default DashboardPage;