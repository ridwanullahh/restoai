import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { sdk } from '../lib/config';
import type { Restaurant } from '../types';
import toast from 'react-hot-toast';

interface RestaurantContextType {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  loading: boolean;
  hasRestaurant: boolean;
  createRestaurant: (data: Partial<Restaurant>) => Promise<Restaurant | null>;
  updateRestaurant: (id: string, data: Partial<Restaurant>) => Promise<Restaurant | null>;
  deleteRestaurant: (id: string) => Promise<boolean>;
  selectRestaurant: (restaurant: Restaurant) => void;
  getRestaurantBySlug: (slug: string) => Restaurant | null;
  refreshRestaurants: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

interface RestaurantProviderProps {
  children: ReactNode;
}

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadRestaurants();
    }
  }, [isAuthenticated, user]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const allRestaurants = await sdk.get<Restaurant>('restaurants');
      
      // Filter restaurants based on user role
      const userRestaurants = user?.roles?.includes('super_admin') 
        ? allRestaurants 
        : allRestaurants.filter(r => r.ownerId === user?.id || r.ownerId === user?.uid);
      
      setRestaurants(userRestaurants);
      
      // Auto-select first restaurant if none selected
      if (!currentRestaurant && userRestaurants.length > 0) {
        setCurrentRestaurant(userRestaurants[0]);
      }
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const createRestaurant = async (data: Partial<Restaurant>): Promise<Restaurant | null> => {
    try {
      setLoading(true);
      
      // Generate slug from name
      const slug = data.name?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim() || '';
      
      const restaurantData: Partial<Restaurant> = {
        ...data,
        slug,
        ownerId: user?.id || user?.uid || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newRestaurant = await sdk.insert<Restaurant>('restaurants', restaurantData);
      setRestaurants(prev => [...prev, newRestaurant]);
      
      // Auto-select the new restaurant
      setCurrentRestaurant(newRestaurant);
      
      toast.success('Restaurant created successfully!');
      return newRestaurant;
    } catch (error) {
      console.error('Failed to create restaurant:', error);
      toast.error('Failed to create restaurant');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (id: string, data: Partial<Restaurant>): Promise<Restaurant | null> => {
    try {
      setLoading(true);
      
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const updatedRestaurant = await sdk.update<Restaurant>('restaurants', id, updatedData);
      
      setRestaurants(prev => 
        prev.map(r => r.id === id || r.uid === id ? updatedRestaurant : r)
      );
      
      if (currentRestaurant && (currentRestaurant.id === id || currentRestaurant.uid === id)) {
        setCurrentRestaurant(updatedRestaurant);
      }
      
      toast.success('Restaurant updated successfully!');
      return updatedRestaurant;
    } catch (error) {
      console.error('Failed to update restaurant:', error);
      toast.error('Failed to update restaurant');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteRestaurant = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await sdk.delete('restaurants', id);
      
      setRestaurants(prev => prev.filter(r => r.id !== id && r.uid !== id));
      
      if (currentRestaurant && (currentRestaurant.id === id || currentRestaurant.uid === id)) {
        setCurrentRestaurant(restaurants.length > 1 ? restaurants[0] : null);
      }
      
      toast.success('Restaurant deleted successfully!');
      return true;
    } catch (error) {
      console.error('Failed to delete restaurant:', error);
      toast.error('Failed to delete restaurant');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const selectRestaurant = (restaurant: Restaurant) => {
    setCurrentRestaurant(restaurant);
  };

  const getRestaurantBySlug = (slug: string): Restaurant | null => {
    return restaurants.find(r => r.slug === slug) || null;
  };

  const refreshRestaurants = async () => {
    await loadRestaurants();
  };

  const hasRestaurant = restaurants.length > 0;

  const value: RestaurantContextType = {
    restaurants,
    currentRestaurant,
    loading,
    hasRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    selectRestaurant,
    getRestaurantBySlug,
    refreshRestaurants,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};