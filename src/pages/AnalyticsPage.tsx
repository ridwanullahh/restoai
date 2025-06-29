import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Star, Calendar, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useRestaurant } from '../contexts/RestaurantContext';
import { sdk } from '../lib/config';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  popularItems: Array<{ name: string; quantity: number; revenue: number }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  ordersByType: Array<{ type: string; count: number; percentage: number }>;
  peakHours: Array<{ hour: number; orders: number }>;
  customerRetention: number;
  averageRating: number;
}

const AnalyticsPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    if (currentRestaurant) {
      loadAnalytics();
    }
  }, [currentRestaurant, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch orders data
      const orders = await sdk.queryBuilder('orders')
        .where((order: any) => 
          order.restaurantId === currentRestaurant?.id &&
          new Date(order.orderDate) >= startDate &&
          new Date(order.orderDate) <= endDate
        )
        .exec();

      // Fetch reviews data
      const reviews = await sdk.queryBuilder('reviews')
        .where((review: any) => review.restaurantId === currentRestaurant?.id)
        .exec();

      // Fetch menu items for popular items analysis
      const menuItems = await sdk.queryBuilder('menuItems')
        .where((item: any) => item.restaurantId === currentRestaurant?.id)
        .exec();

      // Calculate analytics
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
      const totalOrders = orders.length;
      const uniqueCustomers = new Set(orders.map((order: any) => order.customerId)).size;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate popular items
      const itemSales: Record<string, { quantity: number; revenue: number; name: string }> = {};
      orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          if (!itemSales[item.menuItemId]) {
            itemSales[item.menuItemId] = { 
              quantity: 0, 
              revenue: 0, 
              name: item.name 
            };
          }
          itemSales[item.menuItemId].quantity += item.quantity;
          itemSales[item.menuItemId].revenue += item.price * item.quantity;
        });
      });

      const popularItems = Object.values(itemSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Calculate revenue by day
      const revenueByDay: Record<string, { revenue: number; orders: number }> = {};
      orders.forEach((order: any) => {
        const date = new Date(order.orderDate).toISOString().split('T')[0];
        if (!revenueByDay[date]) {
          revenueByDay[date] = { revenue: 0, orders: 0 };
        }
        revenueByDay[date].revenue += order.total;
        revenueByDay[date].orders += 1;
      });

      const revenueData = Object.entries(revenueByDay)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate orders by type
      const orderTypes: Record<string, number> = {};
      orders.forEach((order: any) => {
        orderTypes[order.orderType] = (orderTypes[order.orderType] || 0) + 1;
      });

      const ordersByType = Object.entries(orderTypes).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        percentage: (count / totalOrders) * 100
      }));

      // Calculate peak hours
      const hourlyOrders: Record<number, number> = {};
      orders.forEach((order: any) => {
        const hour = new Date(order.orderDate).getHours();
        hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1;
      });

      const peakHours = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        orders: hourlyOrders[hour] || 0
      }));

      // Calculate average rating
      const averageRating = reviews.length > 0 
         
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Calculate customer retention (simplified)
      const customerRetention = uniqueCustomers > 0 
        ? (orders.filter((order: any) => 
            orders.filter((o: any) => o.customerId === order.customerId).length > 1
          ).length / uniqueCustomers) * 100 
        : 0;

      setAnalytics({
        revenue: totalRevenue,
        orders: totalOrders,
        customers: uniqueCustomers,
        averageOrderValue,
        popularItems,
        revenueByDay: revenueData,
        ordersByType,
        peakHours,
        customerRetention,
        averageRating
      });

    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const data = {
      restaurant: currentRestaurant?.name,
      dateRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: analytics.revenue,
        totalOrders: analytics.orders,
        uniqueCustomers: analytics.customers,
        averageOrderValue: analytics.averageOrderValue,
        averageRating: analytics.averageRating,
        customerRetention: analytics.customerRetention
      },
      popularItems: analytics.popularItems,
      revenueByDay: analytics.revenueByDay,
      ordersByType: analytics.ordersByType
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${currentRestaurant?.slug}-${dateRange}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully!');
  };

  const COLORS = ['#f97316', '#ea580c', '#dc2626', '#7c3aed', '#059669'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your restaurant's performance and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={exportData}
            icon={<Download className="w-4 h-4" />}
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.revenue.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm font-medium text-green-600">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.orders}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm font-medium text-blue-600">+8.3%</span>
                <span className="text-sm text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.customers}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                <span className="text-sm font-medium text-purple-600">+15.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm font-medium text-red-600">-2.1%</span>
                <span className="text-sm text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <p className="text-sm text-gray-600">Daily revenue over the selected period</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`$${value}`, name === 'revenue' ? 'Revenue' : 'Orders']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#ea580c' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Types */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Order Types</h3>
            <p className="text-sm text-gray-600">Distribution of order types</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.ordersByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type} (${percentage.toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.ordersByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Popular Items */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Popular Items</h3>
            <p className="text-sm text-gray-600">Best-selling menu items</p>
          </div>
          <div className="space-y-4">
            {analytics.popularItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.quantity} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${item.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak Hours */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
            <p className="text-sm text-gray-600">Orders by hour of day</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value} orders`, 'Orders']}
                  labelFormatter={(value) => `${value}:00`}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${analytics.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Average Order Value</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {analytics.customerRetention.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Customer Retention Rate</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {analytics.orders > 0 ? (analytics.revenue / analytics.orders * 24).toFixed(0) : 0}
            </div>
            <p className="text-sm text-gray-600">Orders per Day (Avg)</p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default AnalyticsPage;