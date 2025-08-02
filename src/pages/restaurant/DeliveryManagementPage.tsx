import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Clock, 
  User, 
  Phone,
  Navigation,
  Package,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Route,
  DollarSign
} from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Progress from '../../components/common/Progress';
import toast from 'react-hot-toast';

interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: 'bike' | 'scooter' | 'car';
  licensePlate: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation: { lat: number; lng: number };
  rating: number;
  completedDeliveries: number;
  avatar?: string;
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    city: string;
    zipCode: string;
    coordinates: { lat: number; lng: number };
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryFee: number;
  estimatedTime: number;
  actualTime?: number;
  status: 'pending' | 'assigned' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  assignedDriver?: string;
  orderTime: string;
  pickupTime?: string;
  deliveryTime?: string;
  specialInstructions?: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  coordinates: Array<{ lat: number; lng: number }>;
  deliveryFee: number;
  estimatedTime: number;
  active: boolean;
}

const DeliveryManagementPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [stats, setStats] = useState({
    activeDeliveries: 0,
    availableDrivers: 0,
    avgDeliveryTime: 0,
    completedToday: 0,
    revenue: 0
  });

  useEffect(() => {
    if (currentRestaurant) {
      loadDeliveryData();
      
      // Real-time updates every 30 seconds
      const interval = setInterval(loadDeliveryData, 30000);
      return () => clearInterval(interval);
    }
  }, [currentRestaurant]);

  const loadDeliveryData = async () => {
    try {
      setLoading(true);
      
      // Load delivery orders
      const deliveryOrders = await sdk.queryBuilder<DeliveryOrder>('orders')
        .where((order: any) => 
          order.restaurantId === currentRestaurant?.id &&
          order.orderType === 'delivery' &&
          !['delivered', 'cancelled'].includes(order.status)
        )
        .sort('orderTime')
        .exec();
      
      setOrders(deliveryOrders);

      // Load drivers
      const driversData = await sdk.queryBuilder<DeliveryDriver>('drivers')
        .where((driver: any) => driver.restaurantId === currentRestaurant?.id)
        .exec();
      
      setDrivers(driversData);

      // Load delivery zones
      const zonesData = await sdk.queryBuilder<DeliveryZone>('deliveryZones')
        .where((zone: any) => zone.restaurantId === currentRestaurant?.id)
        .exec();
      
      setZones(zonesData);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const completedToday = await sdk.queryBuilder('orders')
        .where((order: any) => 
          order.restaurantId === currentRestaurant?.id &&
          order.orderType === 'delivery' &&
          order.status === 'delivered' &&
          order.orderTime.startsWith(today)
        )
        .exec();

      setStats({
        activeDeliveries: deliveryOrders.length,
        availableDrivers: driversData.filter(d => d.status === 'available').length,
        avgDeliveryTime: 28, // Calculate from historical data
        completedToday: completedToday.length,
        revenue: completedToday.reduce((sum: number, order: any) => sum + order.total, 0)
      });

    } catch (error) {
      console.error('Failed to load delivery data:', error);
      toast.error('Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      await sdk.update('orders', orderId, {
        assignedDriver: driverId,
        status: 'assigned',
        assignedTime: new Date().toISOString()
      });

      await sdk.update('drivers', driverId, {
        status: 'busy'
      });

      toast.success('Driver assigned successfully!');
      await loadDeliveryData();
    } catch (error) {
      console.error('Failed to assign driver:', error);
      toast.error('Failed to assign driver');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'picked-up') {
        updateData.pickupTime = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updateData.deliveryTime = new Date().toISOString();
        // Free up the driver
        const order = orders.find(o => o.id === orderId);
        if (order?.assignedDriver) {
          await sdk.update('drivers', order.assignedDriver, { status: 'available' });
        }
      }

      await sdk.update('orders', orderId, updateData);
      toast.success(`Order ${newStatus}!`);
      await loadDeliveryData();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'picked-up': return 'info';
      case 'in-transit': return 'warning';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getEstimatedDeliveryTime = (orderTime: string, estimatedTime: number) => {
    const orderDate = new Date(orderTime);
    const estimatedDelivery = new Date(orderDate.getTime() + estimatedTime * 60000);
    return estimatedDelivery.toLocaleTimeString();
  };

  const getElapsedTime = (orderTime: string) => {
    const elapsed = (new Date().getTime() - new Date(orderTime).getTime()) / (1000 * 60);
    return Math.floor(elapsed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
          <p className="text-gray-600">Manage deliveries, drivers, and delivery zones</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setIsDriverModalOpen(true)}
            icon={<Plus className="w-5 h-5" />}
            variant="outline"
          >
            Add Driver
          </Button>
          <Button
            onClick={() => setIsZoneModalOpen(true)}
            icon={<Plus className="w-5 h-5" />}
          >
            Add Zone
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Deliveries</p>
              <p className="text-2xl font-bold text-orange-600">{stats.activeDeliveries}</p>
            </div>
            <Truck className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Drivers</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableDrivers}</p>
            </div>
            <User className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgDeliveryTime}m</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completedToday}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Today</p>
              <p className="text-2xl font-bold text-green-600">${stats.revenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {['orders', 'drivers', 'zones'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="cursor-pointer" onClick={() => {
                setSelectedOrder(order);
                setIsOrderModalOpen(true);
              }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">#{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.customerPhone}</p>
                  </div>
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{order.deliveryAddress.street}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {getElapsedTime(order.orderTime)}m elapsed • 
                      ETA: {getEstimatedDeliveryTime(order.orderTime, order.estimatedTime)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="w-4 h-4 mr-2" />
                    <span>{order.items.length} items • ${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {order.assignedDriver ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        name={drivers.find(d => d.id === order.assignedDriver)?.name}
                        size="sm"
                      />
                      <span className="text-sm font-medium">
                        {drivers.find(d => d.id === order.assignedDriver)?.name}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (order.status === 'assigned') {
                          updateOrderStatus(order.id, 'picked-up');
                        } else if (order.status === 'picked-up') {
                          updateOrderStatus(order.id, 'in-transit');
                        } else if (order.status === 'in-transit') {
                          updateOrderStatus(order.id, 'delivered');
                        }
                      }}
                    >
                      {order.status === 'assigned' && 'Mark Picked Up'}
                      {order.status === 'picked-up' && 'In Transit'}
                      {order.status === 'in-transit' && 'Delivered'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Select
                      options={[
                        { value: '', label: 'Select Driver' },
                        ...drivers
                          .filter(d => d.status === 'available')
                          .map(d => ({ value: d.id, label: d.name }))
                      ]}
                      onChange={(e) => {
                        if (e.target.value) {
                          assignDriver(order.id, e.target.value);
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver, index) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar name={driver.name} src={driver.avatar} size="lg" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                      <p className="text-sm text-gray-600">{driver.phone}</p>
                      <p className="text-sm text-gray-500">{driver.vehicleType} • {driver.licensePlate}</p>
                    </div>
                  </div>
                  <Badge variant={getDriverStatusColor(driver.status)}>
                    {driver.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center">
                      <span className="font-medium">{driver.rating.toFixed(1)}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completed Deliveries</span>
                    <span className="font-medium">{driver.completedDeliveries}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Navigation className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone, index) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                    <p className="text-sm text-gray-600">
                      ${zone.deliveryFee.toFixed(2)} delivery fee
                    </p>
                    <p className="text-sm text-gray-500">
                      ~{zone.estimatedTime} min delivery
                    </p>
                  </div>
                  <Badge variant={zone.active ? 'success' : 'error'}>
                    {zone.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View Map
                  </Button>
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
        title={`Order #${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Customer</h3>
                <p className="text-gray-600">{selectedOrder.customerName}</p>
                <p className="text-gray-600">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Status</h3>
                <Badge variant={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
              <p className="text-gray-600">
                {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city} {selectedOrder.deliveryAddress.zipCode}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Items</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedOrder.specialInstructions && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Special Instructions</h3>
                <p className="text-gray-600">{selectedOrder.specialInstructions}</p>
              </div>
            )}

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
              {!selectedOrder.assignedDriver && (
                <Button>
                  Assign Driver
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default DeliveryManagementPage;
