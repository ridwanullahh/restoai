import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  Eye,
  RotateCcw,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { sdk } from '../../lib/config';
import { Customer, Order, MenuItem } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

interface CustomerOrdersPageProps {
  customer: Customer | null;
}

const CustomerOrdersPage: React.FC<CustomerOrdersPageProps> = ({ customer }) => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (customer) {
      loadOrders();

      // Set up real-time order updates
      const interval = setInterval(() => {
        loadOrders();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [customer]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      const ordersData = await sdk.queryBuilder<Order>('orders')
        .where(o => o.customerId === customer?.id)
        .sort('orderDate', 'desc')
        .exec();
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    setFilteredOrders(filtered);
  };

  const handleReorder = async (order: Order) => {
    try {
      setReordering(true);

      // Create a new order with the same items
      const newOrderData = {
        customerId: customer?.id,
        restaurantId: order.restaurantId,
        items: order.items.map(item => ({
          ...item,
          id: undefined // Remove ID to create new items
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        deliveryFee: order.deliveryFee,
        total: order.total,
        status: 'pending',
        orderDate: new Date().toISOString(),
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        specialInstructions: order.specialInstructions
      };

      const newOrder = await sdk.insert('orders', newOrderData);

      toast.success('Order placed successfully! You can track it in your orders.');

      // Refresh orders list
      await loadOrders();

    } catch (error) {
      console.error('Failed to reorder:', error);
      toast.error('Failed to reorder items');
    } finally {
      setReordering(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'preparing': return 'warning';
      case 'ready': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Clock className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canReorder = (order: Order) => {
    return order.status === 'delivered' || order.status === 'cancelled';
  };

  const canReview = (order: Order) => {
    return order.status === 'delivered';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>
        <SkeletonList items={5} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>
        <Link to={`/${restaurantSlug}/menu`}>
          <Button icon={<ShoppingBag className="w-5 h-5" />}>
            Order Again
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search orders or items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Orders</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ShoppingBag className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {orders.length === 0 ? 'No orders yet' : 'No orders found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {orders.length === 0 
              ? 'Start by browsing our delicious menu!'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {orders.length === 0 && (
            <Link to={`/${restaurantSlug}/menu`}>
              <Button>Browse Menu</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.slice(-6)}
                        </h3>
                        <Badge 
                          variant={getStatusColor(order.status)}
                          icon={getStatusIcon(order.status)}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDate(order.orderDate)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items.length} items • ${order.total.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsOrderModalOpen(true);
                        }}
                        icon={<Eye className="w-4 h-4" />}
                      >
                        View Details
                      </Button>
                      
                      {canReorder(order) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(order)}
                          disabled={reordering}
                          icon={<RotateCcw className="w-4 h-4" />}
                        >
                          {reordering ? 'Adding...' : 'Reorder'}
                        </Button>
                      )}
                      
                      {canReview(order) && (
                        <Link to={`/${restaurantSlug}/dashboard/reviews?order=${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Star className="w-4 h-4" />}
                          >
                            Review
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} • ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Order #${selectedOrder?.id.slice(-6)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                <p className="text-sm text-gray-600">{formatDate(selectedOrder.orderDate)}</p>
              </div>
              <Badge 
                variant={getStatusColor(selectedOrder.status)}
                icon={getStatusIcon(selectedOrder.status)}
                size="lg"
              >
                {selectedOrder.status}
              </Badge>
            </div>
            
            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        {item.customizations && item.customizations.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Customizations: {item.customizations.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900">${selectedOrder.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOrderModalOpen(false);
                  setSelectedOrder(null);
                }}
              >
                Close
              </Button>
              
              {canReorder(selectedOrder) && (
                <Button
                  onClick={() => handleReorder(selectedOrder)}
                  disabled={reordering}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  {reordering ? 'Adding...' : 'Reorder'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default CustomerOrdersPage;
