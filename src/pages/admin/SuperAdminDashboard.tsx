import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  BarChart3, 
  Users, 
  Building, 
  CreditCard,
  Settings,
  FileText,
  MessageCircle,
  BookOpen,
  LogOut,
  ChefHat,
  TrendingUp,
  DollarSign,
  Globe,
  Activity,
  Bell,
  Search,
  Filter
} from 'lucide-react';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';
import { sdk } from '../../lib/config';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';

interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalUsers: number;
  monthlyRevenue: number;
  totalOrders: number;
  supportTickets: number;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  email: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastActive: string;
  monthlyRevenue: number;
}

const SuperAdminDashboard: React.FC = () => {
  const { superAdmin, logout, isAuthenticated } = useSuperAdmin();
  const location = useLocation();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/auth" replace />;
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load platform statistics
      const mockStats: PlatformStats = {
        totalRestaurants: 1247,
        activeRestaurants: 1189,
        totalUsers: 45623,
        monthlyRevenue: 284750,
        totalOrders: 156789,
        supportTickets: 23
      };
      setStats(mockStats);

      // Load restaurants data
      const restaurantsData = await sdk.queryBuilder<Restaurant>('restaurants')
        .sort('createdAt', 'desc')
        .exec();
      
      // Generate mock data if none exists
      const mockRestaurants: Restaurant[] = [
        {
          id: '1',
          name: 'Bella Vista Restaurant',
          slug: 'bella-vista',
          email: 'owner@bellavista.com',
          plan: 'professional',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          lastActive: '2024-01-20T14:30:00Z',
          monthlyRevenue: 12450
        },
        {
          id: '2',
          name: 'Urban Eats',
          slug: 'urban-eats',
          email: 'admin@urbaneats.com',
          plan: 'enterprise',
          status: 'active',
          createdAt: '2024-01-10T09:15:00Z',
          lastActive: '2024-01-20T16:45:00Z',
          monthlyRevenue: 28900
        },
        {
          id: '3',
          name: 'Cozy Cafe',
          slug: 'cozy-cafe',
          email: 'hello@cozycafe.com',
          plan: 'starter',
          status: 'active',
          createdAt: '2024-01-08T11:20:00Z',
          lastActive: '2024-01-19T12:10:00Z',
          monthlyRevenue: 3200
        },
        {
          id: '4',
          name: 'Fusion Kitchen',
          slug: 'fusion-kitchen',
          email: 'contact@fusionkitchen.com',
          plan: 'professional',
          status: 'inactive',
          createdAt: '2024-01-05T15:30:00Z',
          lastActive: '2024-01-15T10:20:00Z',
          monthlyRevenue: 8750
        }
      ];

      setRestaurants(restaurantsData.length > 0 ? restaurantsData : mockRestaurants);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'default';
      case 'professional': return 'info';
      case 'enterprise': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" />, path: '/admin/dashboard' },
    { id: 'restaurants', label: 'Restaurants', icon: <Building className="w-5 h-5" />, path: '/admin/restaurants' },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
    { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-5 h-5" />, path: '/admin/subscriptions' },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" />, path: '/admin/analytics' },
    { id: 'blog', label: 'Blog Management', icon: <FileText className="w-5 h-5" />, path: '/admin/blog' },
    { id: 'support', label: 'Support', icon: <MessageCircle className="w-5 h-5" />, path: '/admin/support' },
    { id: 'docs', label: 'Documentation', icon: <BookOpen className="w-5 h-5" />, path: '/admin/docs' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">RestoAI Admin</h1>
              <p className="text-sm text-gray-600">Platform Management</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-orange-600">
                  {superAdmin?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{superAdmin?.name}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
              <p className="text-gray-600">Monitor and manage the RestoAI platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                System Status
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Overview */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalRestaurants.toLocaleString()}</p>
                        <p className="text-sm text-green-600">
                          {stats.activeRestaurants} active
                        </p>
                      </div>
                      <Building className="w-8 h-8 text-orange-500" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                        <p className="text-sm text-blue-600">
                          +12% this month
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                        <p className="text-sm text-green-600">
                          +18% from last month
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Support Tickets</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.supportTickets}</p>
                        <p className="text-sm text-yellow-600">
                          5 pending
                        </p>
                      </div>
                      <MessageCircle className="w-8 h-8 text-yellow-500" />
                    </div>
                  </Card>
                </div>
              )}

              {/* Recent Restaurants */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Restaurants</h2>
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Search restaurants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<Search className="w-4 h-4" />}
                      className="w-64"
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Restaurant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Plan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Active
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRestaurants.map((restaurant) => (
                          <tr key={restaurant.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                  <ChefHat className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {restaurant.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {restaurant.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={getPlanColor(restaurant.plan)} className="capitalize">
                                {restaurant.plan}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={getStatusColor(restaurant.status)} className="capitalize">
                                {restaurant.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(restaurant.monthlyRevenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(restaurant.lastActive)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
