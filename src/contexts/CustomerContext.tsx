import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { sdk } from '../lib/config';
import type { Customer, Order, Review } from '../types';
import toast from 'react-hot-toast';

interface CustomerContextType {
  customer: Customer | null;
  orders: Order[];
  reviews: Review[];
  favoriteRestaurants: string[];
  loyaltyPoints: number;
  loading: boolean;
  createCustomer: (data: Partial<Customer>) => Promise<Customer | null>;
  updateCustomer: (data: Partial<Customer>) => Promise<Customer | null>;
  addToFavorites: (restaurantId: string) => Promise<void>;
  removeFromFavorites: (restaurantId: string) => Promise<void>;
  placeOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  submitReview: (reviewData: Partial<Review>) => Promise<Review | null>;
  loadCustomerData: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && user.roles?.includes('customer')) {
      loadCustomerData();
    }
  }, [isAuthenticated, user]);

  const loadCustomerData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load customer profile
      let customerData = await sdk.queryBuilder<Customer>('customers')
        .where(c => c.email === user.email)
        .exec();
      
      if (customerData.length === 0) {
        // Create customer profile if doesn't exist
        const newCustomer = await sdk.insert<Customer>('customers', {
          email: user.email,
          name: user.name || '',
          phone: user.phone || '',
          preferences: {},
          loyaltyPoints: 0,
          totalOrders: 0,
          favoriteRestaurants: [],
          addresses: []
        });
        setCustomer(newCustomer);
      } else {
        setCustomer(customerData[0]);
      }

      // Load customer orders
      const customerOrders = await sdk.queryBuilder<Order>('orders')
        .where(order => order.customerId === user.id || order.customerId === user.uid)
        .sort('orderDate', 'desc')
        .exec();
      setOrders(customerOrders);

      // Load customer reviews
      const customerReviews = await sdk.queryBuilder<Review>('reviews')
        .where(review => review.customerId === user.id || review.customerId === user.uid)
        .sort('reviewDate', 'desc')
        .exec();
      setReviews(customerReviews);

    } catch (error) {
      console.error('Failed to load customer data:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (data: Partial<Customer>): Promise<Customer | null> => {
    try {
      setLoading(true);
      const newCustomer = await sdk.insert<Customer>('customers', {
        ...data,
        email: user?.email || data.email || '',
        loyaltyPoints: 0,
        totalOrders: 0,
        favoriteRestaurants: [],
        addresses: []
      });
      setCustomer(newCustomer);
      toast.success('Customer profile created successfully!');
      return newCustomer;
    } catch (error) {
      console.error('Failed to create customer:', error);
      toast.error('Failed to create customer profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (data: Partial<Customer>): Promise<Customer | null> => {
    if (!customer) return null;

    try {
      setLoading(true);
      const updatedCustomer = await sdk.update<Customer>('customers', customer.id, data);
      setCustomer(updatedCustomer);
      toast.success('Profile updated successfully!');
      return updatedCustomer;
    } catch (error) {
      console.error('Failed to update customer:', error);
      toast.error('Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (restaurantId: string) => {
    if (!customer) return;

    try {
      const updatedFavorites = [...new Set([...customer.favoriteRestaurants, restaurantId])];
      await updateCustomer({ favoriteRestaurants: updatedFavorites });
      toast.success('Added to favorites!');
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      toast.error('Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (restaurantId: string) => {
    if (!customer) return;

    try {
      const updatedFavorites = customer.favoriteRestaurants.filter(id => id !== restaurantId);
      await updateCustomer({ favoriteRestaurants: updatedFavorites });
      toast.success('Removed from favorites!');
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const placeOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
    if (!customer || !user) return null;

    try {
      setLoading(true);
      const newOrder = await sdk.insert<Order>('orders', {
        ...orderData,
        customerId: user.id || user.uid || '',
        customerInfo: {
          name: customer.name || user.name || '',
          email: customer.email,
          phone: customer.phone || ''
        },
        orderDate: new Date().toISOString(),
        status: 'pending',
        paymentStatus: 'pending'
      });

      // Update customer stats
      await updateCustomer({
        totalOrders: customer.totalOrders + 1,
        loyaltyPoints: customer.loyaltyPoints + Math.floor(newOrder.total),
        lastOrderDate: new Date().toISOString()
      });

      setOrders(prev => [newOrder, ...prev]);
      toast.success('Order placed successfully!');
      return newOrder;
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (reviewData: Partial<Review>): Promise<Review | null> => {
    if (!customer || !user) return null;

    try {
      setLoading(true);
      const newReview = await sdk.insert<Review>('reviews', {
        ...reviewData,
        customerId: user.id || user.uid || '',
        customerName: customer.name || user.name || 'Anonymous',
        reviewDate: new Date().toISOString(),
        verified: true,
        helpful: 0
      });

      setReviews(prev => [newReview, ...prev]);
      toast.success('Review submitted successfully!');
      return newReview;
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value: CustomerContextType = {
    customer,
    orders,
    reviews,
    favoriteRestaurants: customer?.favoriteRestaurants || [],
    loyaltyPoints: customer?.loyaltyPoints || 0,
    loading,
    createCustomer,
    updateCustomer,
    addToFavorites,
    removeFromFavorites,
    placeOrder,
    submitReview,
    loadCustomerData,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};