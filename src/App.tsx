import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { initializeApp } from './lib/config';
import LoadingSpinner from './components/common/LoadingSpinner';

// Restaurant Dashboard Components
import RestaurantAuthPage from './pages/restaurant/RestaurantAuthPage';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';

// Customer Dashboard Components
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerAuthPage from './pages/customer/CustomerAuthPage';

// Public Components
import LandingPage from './pages/LandingPage';
import RestaurantPublicPage from './pages/RestaurantPublicPage';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      await initializeApp();
      setAppInitialized(true);
    };
    initApp();
  }, []);

  if (!appInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <RestaurantProvider>
            <CustomerProvider>
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Restaurant Dashboard Routes */}
                <Route path="/restaurant/auth" element={<RestaurantAuthPage />} />
                <Route path="/restaurant/dashboard/*" element={<RestaurantDashboard />} />
                
                {/* Customer Routes */}
                <Route path="/customer/auth" element={<CustomerAuthPage />} />
                <Route path="/customer/dashboard/*" element={<CustomerDashboard />} />
                
                {/* Dynamic Restaurant Public Pages */}
                <Route path="/:restaurantSlug" element={<RestaurantPublicPage />} />
                <Route path="/:restaurantSlug/order" element={<CustomerDashboard />} />
                <Route path="/:restaurantSlug/menu" element={<RestaurantPublicPage />} />
                <Route path="/:restaurantSlug/reviews" element={<RestaurantPublicPage />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#374151',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </CustomerProvider>
          </RestaurantProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;