import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Timer,
  ChefHat,
  Flame,
  Utensils,
  Bell,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Progress from '../../components/common/Progress';
import toast from 'react-hot-toast';

interface KitchenOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    specialInstructions?: string;
    category: string;
    prepTime: number;
    status: 'pending' | 'preparing' | 'ready';
  }>;
  orderTime: string;
  estimatedTime: number;
  actualTime?: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'preparing' | 'ready' | 'served';
  assignedChef?: string;
  table?: string;
  orderType: 'dine-in' | 'takeout' | 'delivery';
}

interface KitchenStats {
  activeOrders: number;
  avgPrepTime: number;
  completedToday: number;
  pendingOrders: number;
  efficiency: number;
}

const KitchenManagementPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [stats, setStats] = useState<KitchenStats>({
    activeOrders: 0,
    avgPrepTime: 0,
    completedToday: 0,
    pendingOrders: 0,
    efficiency: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (currentRestaurant) {
      loadKitchenData();
      
      // Update current time every second
      const timeInterval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      
      // Refresh kitchen data every 10 seconds
      const dataInterval = setInterval(() => {
        loadKitchenData();
      }, 10000);
      
      return () => {
        clearInterval(timeInterval);
        clearInterval(dataInterval);
      };
    }
  }, [currentRestaurant]);

  const loadKitchenData = async () => {
    try {
      setLoading(true);
      
      // Load active orders
      const ordersData = await sdk.queryBuilder('orders')
        .where((order: any) => 
          order.restaurantId === currentRestaurant?.id &&
          ['pending', 'confirmed', 'preparing'].includes(order.status)
        )
        .sort('orderDate')
        .exec();

      // Transform orders for kitchen display
      const kitchenOrders: KitchenOrder[] = ordersData.map((order: any) => ({
        id: order.id,
        orderNumber: `#${order.id.slice(-6)}`,
        customerName: order.customerInfo?.name || 'Customer',
        items: order.items.map((item: any) => ({
          ...item,
          category: item.category || 'main',
          prepTime: item.prepTime || 15,
          status: 'pending'
        })),
        orderTime: order.orderDate,
        estimatedTime: order.items.reduce((total: number, item: any) => 
          Math.max(total, item.prepTime || 15), 0),
        priority: getPriority(order.orderDate, order.orderType),
        status: order.status === 'pending' ? 'pending' : 
                order.status === 'confirmed' ? 'preparing' : 'ready',
        table: order.tableNumber,
        orderType: order.orderType || 'dine-in'
      }));

      setOrders(kitchenOrders);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const completedToday = await sdk.queryBuilder('orders')
        .where((order: any) => 
          order.restaurantId === currentRestaurant?.id &&
          order.status === 'delivered' &&
          order.orderDate.startsWith(today)
        )
        .exec();

      setStats({
        activeOrders: kitchenOrders.length,
        avgPrepTime: 18, // Calculate from historical data
        completedToday: completedToday.length,
        pendingOrders: kitchenOrders.filter(o => o.status === 'pending').length,
        efficiency: 92 // Calculate based on on-time delivery
      });

    } catch (error) {
      console.error('Failed to load kitchen data:', error);
      toast.error('Failed to load kitchen data');
    } finally {
      setLoading(false);
    }
  };

  const getPriority = (orderTime: string, orderType: string): KitchenOrder['priority'] => {
    const orderDate = new Date(orderTime);
    const now = new Date();
    const minutesWaiting = (now.getTime() - orderDate.getTime()) / (1000 * 60);
    
    if (minutesWaiting > 30) return 'urgent';
    if (minutesWaiting > 20) return 'high';
    if (orderType === 'delivery') return 'high';
    return 'normal';
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await sdk.update('orders', orderId, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Play notification sound
      if (soundEnabled && newStatus === 'ready') {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {}); // Ignore errors if sound fails
      }
      
      toast.success(`Order ${newStatus === 'ready' ? 'completed' : 'updated'}!`);
      await loadKitchenData();
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order');
    }
  };

  const getElapsedTime = (orderTime: string) => {
    const elapsed = (currentTime.getTime() - new Date(orderTime).getTime()) / (1000 * 60);
    return Math.floor(elapsed);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'normal': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'preparing': return 'warning';
      case 'ready': return 'success';
      default: return 'default';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gray-100 min-h-screen"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Display</h1>
          <p className="text-gray-600">
            {currentTime.toLocaleTimeString()} • {orders.length} active orders
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={soundEnabled ? 'default' : 'outline'}
            onClick={() => setSoundEnabled(!soundEnabled)}
            icon={<Bell className="w-5 h-5" />}
          >
            Sound {soundEnabled ? 'On' : 'Off'}
          </Button>
          <Button
            onClick={loadKitchenData}
            icon={<RotateCcw className="w-5 h-5" />}
            variant="outline"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeOrders}</p>
            </div>
            <Utensils className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
        
        <Card className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Prep Time</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgPrepTime}m</p>
            </div>
            <Timer className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Efficiency</p>
              <p className="text-2xl font-bold text-green-600">{stats.efficiency}%</p>
            </div>
            <ChefHat className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={`border-2 rounded-lg p-4 ${getPriorityColor(order.priority)} cursor-pointer hover:shadow-lg transition-shadow`}
              onClick={() => {
                setSelectedOrder(order);
                setIsOrderModalOpen(true);
              }}
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <Badge variant={getPriorityBadge(order.priority)} size="sm">
                    {order.priority}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{order.orderType}</p>
                </div>
              </div>

              {/* Timer */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Elapsed Time</span>
                  <span className={`font-bold ${
                    getElapsedTime(order.orderTime) > order.estimatedTime 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {getElapsedTime(order.orderTime)}m / {order.estimatedTime}m
                  </span>
                </div>
                <Progress 
                  value={(getElapsedTime(order.orderTime) / order.estimatedTime) * 100}
                  variant={getElapsedTime(order.orderTime) > order.estimatedTime ? 'error' : 'default'}
                  className="h-2"
                />
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">
                      {item.quantity}x {item.name}
                    </span>
                    <Badge variant={getStatusColor(item.status)} size="sm">
                      {item.status}
                    </Badge>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {order.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, 'preparing');
                    }}
                    icon={<Play className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Start
                  </Button>
                )}
                
                {order.status === 'preparing' && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, 'ready');
                    }}
                    icon={<CheckCircle className="w-4 h-4" />}
                    className="flex-1"
                    variant="default"
                  >
                    Ready
                  </Button>
                )}
                
                {order.status === 'ready' && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, 'served');
                    }}
                    icon={<Utensils className="w-4 h-4" />}
                    className="flex-1"
                    variant="default"
                  >
                    Served
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <Card className="text-center py-12 bg-white">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
          <p className="text-gray-600">All caught up! New orders will appear here.</p>
        </Card>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Order ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Customer</h3>
                <p className="text-gray-600">{selectedOrder.customerName}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Order Type</h3>
                <p className="text-gray-600 capitalize">{selectedOrder.orderType}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Order Time</h3>
                <p className="text-gray-600">
                  {new Date(selectedOrder.orderTime).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Elapsed</h3>
                <p className="text-gray-600">{getElapsedTime(selectedOrder.orderTime)} minutes</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.quantity}x {item.name}
                      </p>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-600 mt-1">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
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
              
              {selectedOrder.status === 'pending' && (
                <Button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'preparing');
                    setIsOrderModalOpen(false);
                  }}
                  icon={<Play className="w-4 h-4" />}
                >
                  Start Preparing
                </Button>
              )}
              
              {selectedOrder.status === 'preparing' && (
                <Button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'ready');
                    setIsOrderModalOpen(false);
                  }}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Mark Ready
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default KitchenManagementPage;
