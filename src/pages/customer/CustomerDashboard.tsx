import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomer } from '../../contexts/CustomerContext';
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
  const { isAuthenticated, user, loading } = useAuth();
  const { customer } = useCustomer();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.roles?.includes('customer')) {
    return <CustomerAuthPage />;
  }

  return (
    <CustomerLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/customer/dashboard/overview" replace />} />
        <Route path="/overview" element={<CustomerOverview />} />
        <Route path="/orders" element={<CustomerOrders />} />
        <Route path="/reviews" element={<CustomerReviews />} />
        <Route path="/favorites" element={<CustomerFavorites />} />
        <Route path="/loyalty" element={<CustomerLoyalty />} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="*" element={<Navigate to="/customer/dashboard/overview" replace />} />
      </Routes>
    </CustomerLayout>
  );
};

export default CustomerDashboard;