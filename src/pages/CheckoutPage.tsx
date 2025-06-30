import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, MapPin, Clock, Check, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCustomer } from '../contexts/CustomerContext';
import { sdk } from '../lib/config';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CheckoutPage: React.FC = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { customer, placeOrder } = useCustomer();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [orderData, setOrderData] = useState({
    orderType: 'dine-in',
    customerInfo: {
      name: customer?.name || user?.name || '',
      email: customer?.email || user?.email || '',
      phone: customer?.phone || ''
    },
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      instructions: ''
    },
    paymentMethod: {
      type: 'card' as const,
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    },
    notes: ''
  });

  useEffect(() => {
    loadCheckoutData();
    loadCartFromStorage();
  }, [restaurantSlug]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      
      const restaurants = await sdk.queryBuilder<Restaurant>('restaurants')
        .where(r => r.slug === restaurantSlug && r.active === true)
        .exec();
      
      if (restaurants.length > 0) {
        setRestaurant(restaurants[0]);
      }
    } catch (error) {
      console.error('Failed to load checkout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem(`cart_${restaurantSlug}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getDeliveryFee = () => {
    return orderData.orderType === 'delivery' ? 3.99 : 0;
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getDeliveryFee();
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmitOrder = async () => {
    if (!restaurant || !isAuthenticated || cart.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const order = {
        restaurantId: restaurant.id,
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: getSubtotal(),
        tax: getTax(),
        deliveryFee: getDeliveryFee(),
        total: getTotal(),
        orderType: orderData.orderType,
        customerInfo: orderData.customerInfo,
        deliveryAddress: orderData.orderType === 'delivery' ? orderData.deliveryAddress : undefined,
        notes: orderData.notes,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'paid' as const,
        status: 'pending' as const
      };

      const newOrder = await placeOrder(order);
      
      if (newOrder) {
        // Clear cart
        localStorage.removeItem(`cart_${restaurantSlug}`);
        
        // Redirect to order confirmation
        navigate(`/${restaurantSlug}/dashboard/orders`, {
          state: { newOrderId: newOrder.id }
        });
        
        toast.success('Order placed successfully!');
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h1>
          <p className="text-gray-600 mb-4">You need to be signed in to place an order</p>
          <Link to="/customer/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-4">Add some items to your cart before checkout</p>
          <Link to={`/${restaurantSlug}`}>
            <Button>Browse Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link to={`/${restaurantSlug}`} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to {restaurant.name}</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Type</h2>
              <div className="grid grid-cols-3 gap-4">
                {['dine-in', 'takeout', 'delivery'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderData(prev => ({ ...prev, orderType: type }))}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      orderData.orderType === type
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium capitalize">{type.replace('-', ' ')}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Customer Information */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={orderData.customerInfo.name}
                    onChange={(e) => handleInputChange('customerInfo', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={orderData.customerInfo.email}
                    onChange={(e) => handleInputChange('customerInfo', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={orderData.customerInfo.phone}
                    onChange={(e) => handleInputChange('customerInfo', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </Card>

            {/* Delivery Address (if delivery) */}
            {orderData.orderType === 'delivery' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.street}
                      onChange={(e) => handleInputChange('deliveryAddress', 'street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={orderData.deliveryAddress.city}
                        onChange={(e) => handleInputChange('deliveryAddress', 'city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={orderData.deliveryAddress.state}
                        onChange={(e) => handleInputChange('deliveryAddress', 'state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={orderData.deliveryAddress.zipCode}
                        onChange={(e) => handleInputChange('deliveryAddress', 'zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Information */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={orderData.paymentMethod.cardholderName}
                    onChange={(e) => handleInputChange('paymentMethod', 'cardholderName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    value={orderData.paymentMethod.cardNumber}
                    onChange={(e) => handleInputChange('paymentMethod', 'cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={orderData.paymentMethod.expiryDate}
                      onChange={(e) => handleInputChange('paymentMethod', 'expiryDate', e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      value={orderData.paymentMethod.cvv}
                      onChange={(e) => handleInputChange('paymentMethod', 'cvv', e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Special Instructions */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h2>
              <textarea
                value={orderData.notes}
                onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Any special requests or dietary restrictions..."
              />
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
                {orderData.orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>${getDeliveryFee().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                className="mt-6"
                onClick={handleSubmitOrder}
                loading={submitting}
                icon={<Check className="w-5 h-5" />}
              >
                Place Order
              </Button>
            </Card>

            {/* Restaurant Info */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">{restaurant.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Estimated: 25-35 minutes</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;