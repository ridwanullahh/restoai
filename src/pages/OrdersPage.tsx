import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Package, Search, Filter, Eye, Phone, Mail, MapPin } from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { sdk } from '../lib/config';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  uid: string;
  restaurantId: string;
  customerId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    customizations?: Array<{
      name: string;
      option: string;
      price: number;
    }>;
    specialInstructions?: string;
  }>;
  subtotal: number;
  tax: number;
  tip?: number;
  deliveryFee?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderType: 'dine-in' | 'takeout' | 'delivery';
  orderDate: string;
  estimatedTime?: number;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    instructions?: string;
  };
  notes?: string;
  paymentMethod?: {
    type: 'card' | 'cash' | 'digital_wallet';
    last4?: string;
    brand?: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
}

const OrdersPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const statusOptions = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
  const typeOptions = ['all', 'dine-in', 'takeout', 'delivery'];

  useEffect(() => {
    if (currentRestaurant) {
      loadOrders();
      // Set up real-time updates (polling every 30 seconds)
      const interval = setInterval(loadOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [currentRestaurant]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderData = await sdk.queryBuilder<Order>('orders')
        .where(order => order.restaurantId === currentRestaurant?.id)
        .sort('orderDate', 'desc')
        .exec();
      setOrders(orderData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await sdk.update('orders', orderId, { 
        status: newStatus,
        ...(newStatus === 'completed' && { paymentStatus: 'paid' })
      });
      toast.success(`Order ${newStatus} successfully!`);
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow: Record<Order['status'], Order['status'] | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'completed',
      completed: null,
      cancelled: null
    };
    return statusFlow[currentStatus];
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.orderType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Track and manage all incoming orders</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Auto-refresh: 30s
          </div>
          <Button onClick={loadOrders} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {typeOptions.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">#{order.id}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.customerInfo.name}</p>
                    <p className="text-xs text-gray-500">{formatTime(order.orderDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{order.items.length} items</p>
                    {order.estimatedTime && (
                      <p className="text-xs text-orange-600">{order.estimatedTime} min</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewOrderDetails(order)}
                      icon={<Eye className="w-4 h-4" />}
                    >
                      View
                    </Button>
                    
                    {getNextStatus(order.status) && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                      >
                        {getNextStatus(order.status)?.charAt(0).toUpperCase() + getNextStatus(order.status)?.slice(1)}
                      </Button>
                    )}
                    
                    {order.status === 'pending' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Order Items Preview */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found matching your criteria.</p>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Order #${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Information */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{selectedOrder.customerInfo.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedOrder.customerInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedOrder.customerInfo.email}</span>
                  </div>
                  {selectedOrder.deliveryAddress && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <p>{selectedOrder.deliveryAddress.street}</p>
                        <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}</p>
                        {selectedOrder.deliveryAddress.instructions && (
                          <p className="text-gray-600 mt-1">Instructions: {selectedOrder.deliveryAddress.instructions}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Order Information */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Date:</span>
                    <span className="text-sm">{formatTime(selectedOrder.orderDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Type:</span>
                    <span className="text-sm capitalize">{selectedOrder.orderType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  {selectedOrder.estimatedTime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estimated Time:</span>
                      <span className="text-sm">{selectedOrder.estimatedTime} minutes</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Items */}
            <Card className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="mt-1 ml-6">
                          {item.customizations.map((custom, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                              {custom.name}: {custom.option} {custom.price > 0 && `(+$${custom.price.toFixed(2)})`}
                            </p>
                          ))}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-600 mt-1 ml-6">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Total */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Order Total</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                {selectedOrder.tip && selectedOrder.tip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip:</span>
                    <span>${selectedOrder.tip.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.deliveryFee && selectedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>${selectedOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              {getNextStatus(selectedOrder.status) && (
                <Button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!);
                    setIsDetailsModalOpen(false);
                  }}
                >
                  Mark as {getNextStatus(selectedOrder.status)?.charAt(0).toUpperCase() + getNextStatus(selectedOrder.status)?.slice(1)}
                </Button>
              )}
              
              {selectedOrder.status === 'pending' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'cancelled');
                    setIsDetailsModalOpen(false);
                  }}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default OrdersPage;