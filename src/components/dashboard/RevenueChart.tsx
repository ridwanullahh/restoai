import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../common/Card';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

const RevenueChart: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurant) {
      loadRevenueData();
    }
  }, [currentRestaurant]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      
      // Get last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const orders = await sdk.queryBuilder('orders')
        .where((order: any) => 
          order.restaurantId === currentRestaurant?.id &&
          new Date(order.orderDate) >= sevenDaysAgo
        )
        .exec();

      // Group by date
      const revenueByDate: Record<string, { revenue: number; orders: number }> = {};
      
      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        revenueByDate[dateStr] = { revenue: 0, orders: 0 };
      }

      // Aggregate orders
      orders.forEach((order: any) => {
        const date = new Date(order.orderDate).toISOString().split('T')[0];
        if (revenueByDate[date]) {
          revenueByDate[date].revenue += order.total;
          revenueByDate[date].orders += 1;
        }
      });

      const chartData = Object.entries(revenueByDate).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: data.revenue,
        orders: data.orders
      }));

      setData(chartData);
    } catch (error) {
      console.error('Failed to load revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
          <p className="text-sm text-gray-600">Daily revenue for the past week</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 w-full h-full rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
        <p className="text-sm text-gray-600">Daily revenue for the past week</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="h-80"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
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
              formatter={(value, name) => [
                name === 'revenue' ? `$${value}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#f97316" 
              strokeWidth={3}
              dot={{ fill: '#f97316', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#ea580c' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
};

export default RevenueChart;