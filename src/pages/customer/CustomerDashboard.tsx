import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  ShoppingBag,
  Calendar,
  Heart,
  Star,
  Gift,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sdk } from '../../lib/config';
import { Customer, Order, Reservation, Review } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

// Import customer dashboard pages
import CustomerOverviewPage from './CustomerOverviewPage';
import CustomerOrdersPage from './CustomerOrdersPage';
import CustomerReservationsPage from './CustomerReservationsPage';
import CustomerFavoritesPage from './CustomerFavoritesPage';
import CustomerReviewsPage from './CustomerReviewsPage';
import CustomerLoyaltyPage from './CustomerLoyaltyPage';
import CustomerPaymentMethodsPage from './CustomerPaymentMethodsPage';
import CustomerSettingsPage from './CustomerSettingsPage';

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    upcomingReservations: 0,
    favoriteItems: 0,
    pendingReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadCustomerData();
    }
  }, [user]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);

      // Load customer profile
      const customers = await sdk.queryBuilder<Customer>('customers')
        .where(c => c.email === user?.email)
        .exec();

      if (customers.length > 0) {
        const customerData = customers[0];
        setCustomer(customerData);

        // Load customer statistics
        const orders = await sdk.queryBuilder<Order>('orders')
          .where(o => o.customerId === customerData.id)
          .exec();

        const reservations = await sdk.queryBuilder<Reservation>('reservations')
          .where(r => r.customerInfo.email === customerData.email && r.status !== 'cancelled')
          .exec();

        const reviews = await sdk.queryBuilder<Review>('reviews')
          .where(r => r.customerEmail === customerData.email)
          .exec();

        const upcomingReservations = reservations.filter(r =>
          new Date(r.date) >= new Date() && r.status !== 'completed'
        );

        const pendingReviews = orders.filter(o =>
          !reviews.some(r => r.orderId === o.id)
        );

        setStats({
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
          loyaltyPoints: customerData.loyaltyPoints,
          upcomingReservations: upcomingReservations.length,
          favoriteItems: customerData.favoriteItems?.length || 0,
          pendingReviews: pendingReviews.length
        });
      }
    } catch (error) {
      console.error('Failed to load customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: User, label: 'Overview', path: `/${restaurantSlug}/dashboard/overview` },
    { icon: ShoppingBag, label: 'Orders', path: `/${restaurantSlug}/dashboard/orders`, badge: stats.totalOrders },
    { icon: Calendar, label: 'Reservations', path: `/${restaurantSlug}/dashboard/reservations`, badge: stats.upcomingReservations },
    { icon: Heart, label: 'Favorites', path: `/${restaurantSlug}/dashboard/favorites`, badge: stats.favoriteItems },
    { icon: Star, label: 'Reviews', path: `/${restaurantSlug}/dashboard/reviews`, badge: stats.pendingReviews },
    { icon: Gift, label: 'Loyalty & Rewards', path: `/${restaurantSlug}/dashboard/loyalty` },
    { icon: CreditCard, label: 'Payment Methods', path: `/${restaurantSlug}/dashboard/payments` },
    { icon: Settings, label: 'Settings', path: `/${restaurantSlug}/dashboard/settings` },
  ];

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to={`/${restaurantSlug}`} className="text-xl font-bold text-gray-900">
            Customer Portal
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar
              name={customer?.name || user?.email}
              src={customer?.avatar}
              size="lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {customer?.name || 'Customer'}
              </h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <div className="flex items-center mt-1">
                <Gift className="w-4 h-4 text-orange-600 mr-1" />
                <span className="text-sm font-medium text-orange-600">
                  {stats.loyaltyPoints} points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </div>
              {item.badge && item.badge > 0 && (
                <Badge variant="secondary" size="sm">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start"
            icon={<LogOut className="w-5 h-5" />}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
              <h1 className="ml-2 lg:ml-0 text-xl font-semibold text-gray-900">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" icon={<Bell className="w-5 h-5" />}>
                Notifications
              </Button>
              <Link to={`/${restaurantSlug}`}>
                <Button variant="outline">Back to Restaurant</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="/overview" element={<CustomerOverviewPage customer={customer} stats={stats} />} />
            <Route path="/orders" element={<CustomerOrdersPage customer={customer} />} />
            <Route path="/reservations" element={<CustomerReservationsPage customer={customer} />} />
            <Route path="/favorites" element={<CustomerFavoritesPage customer={customer} />} />
            <Route path="/reviews" element={<CustomerReviewsPage customer={customer} />} />
            <Route path="/loyalty" element={<CustomerLoyaltyPage customer={customer} />} />
            <Route path="/payments" element={<CustomerPaymentMethodsPage customer={customer} />} />
            <Route path="/settings" element={<CustomerSettingsPage customer={customer} onUpdate={loadCustomerData} />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;