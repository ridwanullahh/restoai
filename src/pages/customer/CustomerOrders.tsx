import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Filter, Eye, RefreshCw, Star } from 'lucide-react';
import { useCustomer } from '../../contexts/CustomerContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const CustomerOrders: React.FC = () => {
  const { orders } = useCustomer();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const statusOptions = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
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

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your order history and status</p>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          </Card>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items.length} items • {order.orderType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                      {order.estimatedTime && order.status !== 'completed' && (
                        <p className="text-sm text-orange-600">{order.estimatedTime} min</p>
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
                      
                      {order.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Star className="w-4 h-4" />}
                        >
                          Review
                        </Button>
                      )}
                      
                      {['pending', 'confirmed'].includes(order.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<RefreshCw className="w-4 h-4" />}
                        >
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Order Items Preview */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item: any, idx: number) => (
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
          ))
        )}
      </div>

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
              {/* Order Information */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Date:</span>
                    <span className="text-sm">{new Date(selectedOrder.orderDate).toLocaleString()}</span>
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
                </div>
              </Card>

              {/* Payment Information */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </span>
                  </div>
                  {selectedOrder.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment Method:</span>
                      <span className="text-sm capitalize">{selectedOrder.paymentMethod.type}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Order Items */}
            <Card className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
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
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default CustomerOrders;