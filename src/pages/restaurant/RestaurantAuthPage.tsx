import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';

const RestaurantAuthPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Redirect if already authenticated as restaurant owner
  if (isAuthenticated && user?.roles?.includes('restaurant_owner')) {
    return <Navigate to="/restaurant/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-5"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Dashboard</h1>
          <p className="text-gray-600">Manage your restaurant with powerful AI tools</p>
        </div>
        
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleMode={() => setIsLogin(true)} />
        )}
      </motion.div>
    </div>
  );
};

export default RestaurantAuthPage;