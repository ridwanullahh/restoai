import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRestaurant } from '../../contexts/RestaurantContext';
import RestaurantAuthPage from './RestaurantAuthPage';
import RestaurantOnboarding from './RestaurantOnboarding';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Restaurant Dashboard Pages
import DashboardPage from '../DashboardPage';
import MenuPage from '../MenuPage';
import OrdersPage from '../OrdersPage';
import ReviewsPage from '../ReviewsPage';
import AnalyticsPage from '../AnalyticsPage';
import CustomersPage from './CustomersPage';
import AIAssistantPage from './AIAssistantPage';
import InventoryPage from './InventoryPage';
import PromotionsPage from './PromotionsPage';
import SettingsPage from './SettingsPage';
import MenuCategoriesPage from './MenuCategoriesPage';
import ThemeManagementPage from './ThemeManagementPage';
import BlogManagementPage from './BlogManagementPage';
import ReservationsPage from './ReservationsPage';
import DiscountManagementPage from './DiscountManagementPage';
import CRMPage from './CRMPage';
import EmailMarketingPage from './EmailMarketingPage';
import ReferralManagementPage from './ReferralManagementPage';
import ReputationManagementPage from './ReputationManagementPage';

const RestaurantLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto" />
        <main className="flex-1 ml-64 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

const RestaurantDashboard: React.FC = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const { isAuthenticated, user, loading } = useAuth();
  const { restaurants, currentRestaurant, selectRestaurant, loading: restaurantLoading } = useRestaurant();

  // Find restaurant by slug and set as current
  React.useEffect(() => {
    if (restaurantSlug && restaurants.length > 0) {
      const restaurant = restaurants.find(r => r.slug === restaurantSlug);
      if (restaurant && (!currentRestaurant || currentRestaurant.slug !== restaurantSlug)) {
        selectRestaurant(restaurant);
      }
    }
  }, [restaurantSlug, restaurants, currentRestaurant, selectRestaurant]);

  if (loading || restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.roles?.includes('restaurant_owner')) {
    return <RestaurantAuthPage />;
  }

  // Check if user owns this restaurant
  const restaurant = restaurants.find(r => r.slug === restaurantSlug);
  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">You don't have access to this restaurant's admin panel.</p>
          <Navigate to="/restaurant/auth" replace />
        </div>
      </div>
    );
  }

  // Show onboarding if user doesn't have any restaurants
  if (restaurants.length === 0) {
    return <RestaurantOnboarding />;
  }

  return (
    <RestaurantLayout>
      <Routes>
        <Route path="/" element={<Navigate to="overview" replace />} />
        <Route path="/overview" element={<DashboardPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu-categories" element={<MenuCategoriesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/crm" element={<CRMPage />} />
        <Route path="/discounts" element={<DiscountManagementPage />} />
        <Route path="/blog" element={<BlogManagementPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/email-marketing" element={<EmailMarketingPage />} />
        <Route path="/referrals" element={<ReferralManagementPage />} />
        <Route path="/reputation" element={<ReputationManagementPage />} />
        <Route path="/themes" element={<ThemeManagementPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </RestaurantLayout>
  );
};

export default RestaurantDashboard;