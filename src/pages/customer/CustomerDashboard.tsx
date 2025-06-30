import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomer } from '../../contexts/CustomerContext';
import { useRestaurant } from '../../contexts/RestaurantContext';
import CustomerAuthPage from './CustomerAuthPage';
import CustomerHeader from '../../components/customer/CustomerHeader';
import CustomerSidebar from '../../components/customer/CustomerSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Customer Dashboard Pages
import CustomerOverview from './CustomerOverview';
import CustomerOrders from './CustomerOrders';
import CustomerReviews from './CustomerReviews';
import CustomerFavorites from './CustomerFavorites';
import CustomerProfile from './CustomerProfile';
import CustomerLoyalty from './CustomerLoyalty';

const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      <div className="flex">
        <CustomerSidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto" />
        <main className="flex-1 ml-64 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

const CustomerDashboard: React.FC = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const { isAuthenticated, user, loading } = useAuth();
  const { customer } = useCustomer();
  const { restaurants } = useRestaurant();

  // Find restaurant by slug
  const restaurant = restaurants.find(r => r.slug === restaurantSlug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <CustomerAuthPage />;
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">The restaurant you're looking for doesn't exist.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return (
    <CustomerLayout>
      <Routes>
        <Route path="/" element={<Navigate to="overview" replace />} />
        <Route path="/overview" element={<CustomerOverview />} />
        <Route path="/orders" element={<CustomerOrders />} />
        <Route path="/reviews" element={<CustomerReviews />} />
        <Route path="/favorites" element={<CustomerFavorites />} />
        <Route path="/loyalty" element={<CustomerLoyalty />} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </CustomerLayout>
  );
};

export default CustomerDashboard;