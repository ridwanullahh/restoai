import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { SuperAdminProvider } from './contexts/SuperAdminContext';
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
import CheckoutPage from './pages/CheckoutPage';
import MenuItemDetailPage from './pages/MenuItemDetailPage';
import ReservationBookingPage from './pages/ReservationBookingPage';

// Marketing Pages
import MarketingHomePage from './pages/marketing/MarketingHomePage';
import FeaturesPage from './pages/marketing/FeaturesPage';
import PricingPage from './pages/marketing/PricingPage';
import AboutPage from './pages/marketing/AboutPage';
import ContactPage from './pages/marketing/ContactPage';

// Blog System
import BlogPage from './pages/blog/BlogPage';
import BlogPostPage from './pages/blog/BlogPostPage';

// Documentation & Support
import DocsPage from './pages/docs/DocsPage';
import SupportPage from './pages/support/SupportPage';

// Super Admin System
import SuperAdminAuthPage from './pages/admin/SuperAdminAuthPage';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const [appInitialized, setAppInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const success = await initializeApp();
        if (success) {
          setAppInitialized(true);
        } else {
          setInitError('Failed to initialize the application. Please check your configuration.');
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      }
    };
    initApp();
  }, []);

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Configuration Error!</strong>
            <span className="block sm:inline"> {initError}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p className="text-sm">
              <strong>Quick Fix:</strong>
              <br />
              1. Copy <code>.env.example</code> to <code>.env</code>
              <br />
              2. Add your GitHub token and repository details
              <br />
              3. Refresh the page
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!appInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Initializing RestaurantOS...</p>
          <p className="text-sm text-gray-500">Connecting to GitHub database...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <RestaurantProvider>
            <CustomerProvider>
              <SuperAdminProvider>
              <Routes>
                {/* Marketing Website */}
                <Route path="/" element={<MarketingHomePage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Platform Blog & Documentation */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/docs/:slug" element={<DocsPage />} />
                <Route path="/support" element={<SupportPage />} />

                {/* Super Admin System */}
                <Route path="/admin/auth" element={<SuperAdminAuthPage />} />
                <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
                <Route path="/admin/*" element={<SuperAdminDashboard />} />

                {/* Restaurant Authentication */}
                <Route path="/restaurant/auth" element={<RestaurantAuthPage />} />

                {/* Restaurant Dashboard Routes - /restaurantslug/admin/* */}
                <Route path="/:restaurantSlug/admin/*" element={<RestaurantDashboard />} />

                {/* Customer Authentication */}
                <Route path="/customer/auth" element={<CustomerAuthPage />} />

                {/* Customer Dashboard Routes - /restaurantslug/dashboard/* */}
                <Route path="/:restaurantSlug/dashboard/*" element={<CustomerDashboard />} />

                {/* Restaurant Public Pages */}
                <Route path="/:restaurantSlug" element={<RestaurantPublicPage />} />
                <Route path="/:restaurantSlug/menu" element={<RestaurantPublicPage />} />
                <Route path="/:restaurantSlug/menu/:itemId" element={<MenuItemDetailPage />} />
                <Route path="/:restaurantSlug/reviews" element={<RestaurantPublicPage />} />
                <Route path="/:restaurantSlug/checkout" element={<CheckoutPage />} />
                <Route path="/:restaurantSlug/reservations" element={<ReservationBookingPage />} />
                <Route path="/:restaurantSlug/blog" element={<BlogPage />} />
                <Route path="/:restaurantSlug/blog/:postSlug" element={<BlogPostPage />} />

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
              </SuperAdminProvider>
            </CustomerProvider>
          </RestaurantProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;