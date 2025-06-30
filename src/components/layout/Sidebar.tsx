import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Menu, 
  ShoppingBag, 
  Star, 
  Users, 
  BarChart3, 
  MessageCircle, 
  Package, 
  Gift,
  Settings
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/restaurant/dashboard/overview' },
    { icon: Menu, label: 'Menu Management', path: '/restaurant/dashboard/menu' },
    { icon: ShoppingBag, label: 'Orders', path: '/restaurant/dashboard/orders' },
    { icon: Star, label: 'Reviews', path: '/restaurant/dashboard/reviews' },
    { icon: Users, label: 'Customers', path: '/restaurant/dashboard/customers' },
    { icon: BarChart3, label: 'Analytics', path: '/restaurant/dashboard/analytics' },
    { icon: MessageCircle, label: 'AI Assistant', path: '/restaurant/dashboard/ai-assistant' },
    { icon: Package, label: 'Inventory', path: '/restaurant/dashboard/inventory' },
    { icon: Gift, label: 'Promotions', path: '/restaurant/dashboard/promotions' },
    { icon: Settings, label: 'Settings', path: '/restaurant/dashboard/settings' },
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
                    ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
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

export default Sidebar;