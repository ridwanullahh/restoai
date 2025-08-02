import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Filter,
  PieChart,
  BarChart3,
  FileText,
  CreditCard,
  Receipt,
  Target
} from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Progress from '../../components/common/Progress';
import { SkeletonCard } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

interface FinancialData {
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
  avgOrderValue: number;
  topSellingItems: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  type: 'fixed' | 'variable';
}

const FinancialReportsPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [reportType, setReportType] = useState('overview');

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 3 Months' },
    { value: '365', label: 'Last Year' }
  ];

  const reportTypeOptions = [
    { value: 'overview', label: 'Overview' },
    { value: 'revenue', label: 'Revenue Analysis' },
    { value: 'expenses', label: 'Expense Breakdown' },
    { value: 'profit', label: 'Profit & Loss' },
    { value: 'tax', label: 'Tax Report' }
  ];

  useEffect(() => {
    if (currentRestaurant) {
      loadFinancialData();
    }
  }, [currentRestaurant, dateRange]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Load orders for the period
      const orders = await sdk.queryBuilder('orders')
        .where((order: any) => 
          order.restaurantId === currentRestaurant?.id &&
          new Date(order.orderDate) >= startDate &&
          new Date(order.orderDate) <= endDate &&
          order.status === 'delivered'
        )
        .exec();

      // Load expenses
      const expenseData = await sdk.queryBuilder<Expense>('expenses')
        .where((expense: any) => 
          expense.restaurantId === currentRestaurant?.id &&
          new Date(expense.date) >= startDate &&
          new Date(expense.date) <= endDate
        )
        .exec();
      setExpenses(expenseData);

      // Calculate financial metrics
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
      const totalExpenses = expenseData.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate top selling items
      const itemSales: { [key: string]: { revenue: number; quantity: number; name: string } } = {};
      orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          if (!itemSales[item.id]) {
            itemSales[item.id] = { revenue: 0, quantity: 0, name: item.name };
          }
          itemSales[item.id].revenue += item.price * item.quantity;
          itemSales[item.id].quantity += item.quantity;
        });
      });

      const topSellingItems = Object.values(itemSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate payment method breakdown
      const paymentMethods: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        const method = order.paymentMethod || 'card';
        paymentMethods[method] = (paymentMethods[method] || 0) + order.total;
      });

      const paymentMethodsArray = Object.entries(paymentMethods).map(([method, amount]) => ({
        method,
        amount,
        percentage: (amount / totalRevenue) * 100
      }));

      // Calculate daily revenue
      const dailyRevenue: { [key: string]: { revenue: number; orders: number } } = {};
      orders.forEach((order: any) => {
        const date = order.orderDate.split('T')[0];
        if (!dailyRevenue[date]) {
          dailyRevenue[date] = { revenue: 0, orders: 0 };
        }
        dailyRevenue[date].revenue += order.total;
        dailyRevenue[date].orders += 1;
      });

      const dailyRevenueArray = Object.entries(dailyRevenue)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setFinancialData({
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalRevenue - totalExpenses,
        orders: totalOrders,
        avgOrderValue,
        topSellingItems,
        paymentMethods: paymentMethodsArray,
        dailyRevenue: dailyRevenueArray
      });

    } catch (error) {
      console.error('Failed to load financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!financialData) return;
    
    const reportData = {
      restaurant: currentRestaurant?.name,
      period: `${dateRange} days`,
      generatedAt: new Date().toISOString(),
      summary: {
        revenue: financialData.revenue,
        expenses: financialData.expenses,
        profit: financialData.profit,
        orders: financialData.orders,
        avgOrderValue: financialData.avgOrderValue
      },
      topSellingItems: financialData.topSellingItems,
      paymentMethods: financialData.paymentMethods,
      expenses: expenses
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${dateRange}days-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getExpensesByCategory = () => {
    const categories: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: financialData ? (amount / financialData.expenses) * 100 : 0
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Track revenue, expenses, and profitability</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            options={dateRangeOptions}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
          <Select
            options={reportTypeOptions}
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          />
          <Button
            onClick={exportReport}
            icon={<Download className="w-5 h-5" />}
            variant="outline"
          >
            Export Report
          </Button>
        </div>
      </div>

      {financialData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(financialData.revenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+12.5%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(financialData.expenses)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-sm text-red-600">-3.2%</span>
                  </div>
                </div>
                <Receipt className="w-8 h-8 text-red-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${
                    financialData.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(financialData.profit)}
                  </p>
                  <div className="flex items-center mt-2">
                    <Target className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-600">
                      {((financialData.profit / financialData.revenue) * 100).toFixed(1)}% margin
                    </span>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(financialData.avgOrderValue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <BarChart3 className="w-4 h-4 text-purple-600 mr-1" />
                    <span className="text-sm text-purple-600">{financialData.orders} orders</span>
                  </div>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </Card>
          </div>

          {/* Charts and Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Selling Items */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {financialData.topSellingItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <span className="text-sm text-gray-600">{formatCurrency(item.revenue)}</span>
                      </div>
                      <Progress 
                        value={(item.revenue / financialData.topSellingItems[0].revenue) * 100}
                        variant="default"
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">{item.quantity} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Methods */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {financialData.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {method.method}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(method.amount)}
                        </span>
                      </div>
                      <Progress 
                        value={method.percentage}
                        variant="default"
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {method.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Expense Breakdown */}
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getExpensesByCategory().map((category, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                  <Progress 
                    value={category.percentage}
                    variant="warning"
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {category.percentage.toFixed(1)}% of expenses
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Daily Revenue Trend */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Daily Revenue Trend</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              {financialData.dailyRevenue.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="text-sm text-gray-600">{day.orders} orders</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(day.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
};

export default FinancialReportsPage;
