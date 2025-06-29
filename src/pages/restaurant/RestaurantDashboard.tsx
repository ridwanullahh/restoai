import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRestaurant } from '../../contexts/RestaurantContext';
import RestaurantAuthPage from './RestaurantAuthPage';
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
  const { isAuthenticated, user, loading } = useAuth();
  const { currentRestaurant } = useRestaurant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.roles?.includes('restaurant_owner')) {
    return <RestaurantAuthPage />;
  }

  return (
    <RestaurantLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/restaurant/dashboard/overview" replace />} />
        <Route path="/overview" element={<DashboardPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/restaurant/dashboard/overview" replace />} />
      </Routes>
    </RestaurantLayout>
  );
};

export default RestaurantDashboard;