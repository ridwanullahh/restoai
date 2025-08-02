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
  Settings,
  Folder,
  Palette,
  FileText,
  Calendar,
  Percent,
  UserCheck,
  Mail,
  Share2,
  Shield
} from 'lucide-react';
import { useLocation, Link, useParams } from 'react-router-dom';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const location = useLocation();
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/${restaurantSlug}/admin/overview` },
    { icon: Menu, label: 'Menu Management', path: `/${restaurantSlug}/admin/menu` },
    { icon: Folder, label: 'Menu Categories', path: `/${restaurantSlug}/admin/menu-categories` },
    { icon: ShoppingBag, label: 'Orders', path: `/${restaurantSlug}/admin/orders` },
    { icon: Calendar, label: 'Reservations', path: `/${restaurantSlug}/admin/reservations` },
    { icon: Star, label: 'Reviews', path: `/${restaurantSlug}/admin/reviews` },
    { icon: Users, label: 'Customers', path: `/${restaurantSlug}/admin/customers` },
    { icon: UserCheck, label: 'CRM & Segments', path: `/${restaurantSlug}/admin/crm` },
    { icon: Percent, label: 'Discounts', path: `/${restaurantSlug}/admin/discounts` },
    { icon: FileText, label: 'Blog Management', path: `/${restaurantSlug}/admin/blog` },
    { icon: BarChart3, label: 'Analytics', path: `/${restaurantSlug}/admin/analytics` },
    { icon: MessageCircle, label: 'AI Assistant', path: `/${restaurantSlug}/admin/ai-assistant` },
    { icon: Package, label: 'Inventory', path: `/${restaurantSlug}/admin/inventory` },
    { icon: Gift, label: 'Promotions', path: `/${restaurantSlug}/admin/promotions` },
    { icon: Mail, label: 'Email Marketing', path: `/${restaurantSlug}/admin/email-marketing` },
    { icon: Share2, label: 'Referrals', path: `/${restaurantSlug}/admin/referrals` },
    { icon: Shield, label: 'Reputation', path: `/${restaurantSlug}/admin/reputation` },
    { icon: Palette, label: 'Themes', path: `/${restaurantSlug}/admin/themes` },
    { icon: Settings, label: 'Settings', path: `/${restaurantSlug}/admin/settings` },
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