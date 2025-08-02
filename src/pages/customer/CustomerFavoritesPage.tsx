import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Plus, Trash2 } from 'lucide-react';
import { sdk } from '../../lib/config';
import { Customer, MenuItem } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { SkeletonCard } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

interface CustomerFavoritesPageProps {
  customer: Customer | null;
}

const CustomerFavoritesPage: React.FC<CustomerFavoritesPageProps> = ({ customer }) => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [favoriteItems, setFavoriteItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer) {
      loadFavorites();
    }
  }, [customer]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      if (customer?.favoriteItems && customer.favoriteItems.length > 0) {
        const items = await sdk.queryBuilder<MenuItem>('menuItems')
          .where(item => customer.favoriteItems.includes(item.id))
          .exec();
        setFavoriteItems(items);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (itemId: string) => {
    try {
      const updatedFavorites = customer?.favoriteItems?.filter(id => id !== itemId) || [];
      
      await sdk.update('customers', customer?.id, {
        favoriteItems: updatedFavorites,
        updatedAt: new Date().toISOString()
      });
      
      setFavoriteItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600">Your saved menu items</p>
        </div>
        <Link to={`/${restaurantSlug}/menu`}>
          <Button icon={<Plus className="w-5 h-5" />}>
            Browse Menu
          </Button>
        </Link>
      </div>

      {favoriteItems.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Heart className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-4">Start adding items to your favorites!</p>
          <Link to={`/${restaurantSlug}/menu`}>
            <Button>Browse Menu</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="overflow-hidden">
                <div className="relative">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-bold text-orange-600">${item.price.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                        </div>
                      )}
                      {item.isPopular && (
                        <Badge variant="secondary" size="sm">Popular</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(item.id)}
                        icon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700"
                      />
                      <Button
                        size="sm"
                        icon={<ShoppingBag className="w-4 h-4" />}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CustomerFavoritesPage;
