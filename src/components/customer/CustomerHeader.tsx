import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, LogOut, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomer } from '../../contexts/CustomerContext';
import Button from '../common/Button';

const CustomerHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { customer, loyaltyPoints } = useCustomer();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Customer Portal</h1>
              <p className="text-sm text-gray-600">Your dining experience dashboard</p>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Loyalty Points */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 rounded-full">
            <span className="text-sm font-medium text-purple-700">{loyaltyPoints} points</span>
          </div>

          <Button variant="ghost" size="sm" icon={<Bell className="w-5 h-5" />} />
          <Button variant="ghost" size="sm" icon={<Settings className="w-5 h-5" />} />
          
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{customer?.name || user?.name || user?.email}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              icon={<LogOut className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;