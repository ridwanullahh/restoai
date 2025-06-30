import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Star, 
  Heart, 
  Gift,
  User,
  Settings
} from 'lucide-react';
import { useLocation, Link, useParams } from 'react-router-dom';

interface CustomerSidebarProps {
  className?: string;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ className = '' }) => {
  const location = useLocation();
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: `/${restaurantSlug}/dashboard/overview` },
    { icon: ShoppingBag, label: 'My Orders', path: `/${restaurantSlug}/dashboard/orders` },
    { icon: Star, label: 'My Reviews', path: `/${restaurantSlug}/dashboard/reviews` },
    { icon: Heart, label: 'Favorites', path: `/${restaurantSlug}/dashboard/favorites` },
    { icon: Gift, label: 'Loyalty Program', path: `/${restaurantSlug}/dashboard/loyalty` },
    { icon: User, label: 'Profile', path: `/${restaurantSlug}/dashboard/profile` },
  ];

  return (
    <aside className={`bg-white border-r border-gray-200 w-64 ${className}`}>
      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
};

export default CustomerSidebar;