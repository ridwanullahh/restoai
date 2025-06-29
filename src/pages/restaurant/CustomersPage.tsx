import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Mail, Phone, Star, Gift, TrendingUp, Calendar } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastOrderDate: string;
  averageRating: number;
  favoriteItems: string[];
  joinDate: string;
}

const CustomersPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalSpent');

  useEffect(() => {
    if (currentRestaurant) {
      loadCustomers();
    }
  }, [currentRestaurant]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      // Get all orders for this restaurant
      const orders = await sdk.queryBuilder('orders')
        .where((order: any) => order.restaurantId === currentRestaurant?.id)
        .exec();

      // Get all reviews for this restaurant
      const reviews = await sdk.queryBuilder('reviews')
        .where((review: any) => review.restaurantId === currentRestaurant?.id)
        .exec();

      // Group orders by customer
      const customerData: Record<string, any> = {};
      
      orders.forEach((order: any) => {
        const customerId = order.customerId;
        if (!customerData[customerId]) {
          customerData[customerId] = {
            id: customerId,
            name: order.customerInfo.name,
            email: order.customerInfo.email,
            phone: order.customerInfo.phone,
            orders: [],
            totalSpent: 0,
            joinDate: order.orderDate
          };
        }
        customerData[customerId].orders.push(order);
        customerData[customerId].totalSpent += order.total;
        
        // Update join date to earliest order
        if (new Date(order.orderDate) < new Date(customerData[customerId].joinDate)) {
          customerData[customerId].joinDate = order.orderDate;
        }
      });

      // Calculate customer metrics
      const processedCustomers = Object.values(customerData).map((customer: any) => {
        const customerReviews = reviews.filter((review: any) => review.customerId === customer.id);
        const averageRating = customerReviews.length > 0 
          ? customerReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / customerReviews.length 
          : 0;

        const lastOrder = customer.orders.sort((a: any, b: any) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        )[0];

        // Calculate favorite items
        const itemCounts: Record<string, number> = {};
        customer.orders.forEach((order: any) => {
          order.items.forEach((item: any) => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
          });
        });

        const favoriteItems = Object.entries(itemCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([name]) => name);

        return {
          ...customer,
          totalOrders: customer.orders.length,
          loyaltyPoints: Math.floor(customer.totalSpent * 10), // 10 points per dollar
          lastOrderDate: lastOrder?.orderDate || customer.joinDate,
          averageRating,
          favoriteItems
        };
      });

      setCustomers(processedCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'totalOrders':
          return b.totalOrders - a.totalOrders;
        case 'loyaltyPoints':
          return b.loyaltyPoints - a.loyaltyPoints;
        case 'lastOrderDate':
          return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
        default:
          return 0;
      }
    });

  const customerStats = {
    total: customers.length,
    totalRevenue: customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
    averageOrderValue: customers.length > 0 
      ? customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / 
        customers.reduce((sum, customer) => sum + customer.totalOrders, 0)
      : 0,
    repeatCustomers: customers.filter(customer => customer.totalOrders > 1).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage and analyze your customer relationships</p>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customerStats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${customerStats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">${customerStats.averageOrderValue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Repeat Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customerStats.repeatCustomers}</p>
              <p className="text-xs text-gray-500">
                {((customerStats.repeatCustomers / customerStats.total) * 100).toFixed(1)}% retention
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Gift className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="totalSpent">Total Spent</option>
                <option value="totalOrders">Total Orders</option>
                <option value="loyaltyPoints">Loyalty Points</option>
                <option value="lastOrderDate">Last Order</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedCustomers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                </div>
                
                {customer.loyaltyPoints > 500 && (
                  <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    VIP
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-lg font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Loyalty Points</p>
                  <p className="text-lg font-semibold text-orange-600">{customer.loyaltyPoints}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Rating</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">
                      {customer.averageRating > 0 ? customer.averageRating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {customer.favoriteItems.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Favorite Items</p>
                  <div className="flex flex-wrap gap-1">
                    {customer.favoriteItems.slice(0, 2).map((item, idx) => (
                      <span key={idx} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {item}
                      </span>
                    ))}
                    {customer.favoriteItems.length > 2 && (
                      <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{customer.favoriteItems.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {new Date(customer.joinDate).toLocaleDateString()}</span>
                </div>
                <span>Last order: {new Date(customer.lastOrderDate).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Button variant="outline" size="sm" icon={<Mail className="w-4 h-4" />}>
                  Email
                </Button>
                <Button variant="outline" size="sm" icon={<Phone className="w-4 h-4" />}>
                  Call
                </Button>
                <Button variant="outline" size="sm" icon={<Gift className="w-4 h-4" />}>
                  Reward
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredAndSortedCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No customers found matching your criteria.</p>
        </div>
      )}
    </motion.div>
  );
};

export default CustomersPage;