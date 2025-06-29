import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Star, MapPin, Phone, Globe } from 'lucide-react';
import { useCustomer } from '../../contexts/CustomerContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  coverImage: string;
  description: string;
  address: string;
  phone: string;
  website: string;
}

const CustomerFavorites: React.FC = () => {
  const { customer, favoriteRestaurants, removeFromFavorites } = useCustomer();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFavoriteRestaurants();
  }, [favoriteRestaurants]);

  const loadFavoriteRestaurants = async () => {
    try {
      setLoading(true);
      if (favoriteRestaurants.length > 0) {
        const restaurantData = await sdk.queryBuilder<Restaurant>('restaurants')
          .where(r => favoriteRestaurants.includes(r.id))
          .exec();
        setRestaurants(restaurantData);
      } else {
        setRestaurants([]);
      }
    } catch (error) {
      console.error('Failed to load favorite restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Favorite Restaurants</h1>
          <p className="text-gray-600">Your saved restaurants for quick access</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{restaurants.length}</div>
            <p className="text-sm text-gray-600">Favorite Restaurants</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {restaurants.length > 0 
                ? (restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length).toFixed(1)
                : '0.0'
              }
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(restaurants.length > 0 
                ? Math.round(restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length)
                : 0
              )}
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {new Set(restaurants.map(r => r.cuisine)).size}
            </div>
            <p className="text-sm text-gray-600">Cuisine Types</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search favorite restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Restaurants Grid */}
      {filteredRestaurants.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {restaurants.length === 0 
                ? "You haven't added any favorite restaurants yet"
                : "No restaurants match your search"
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="overflow-hidden">
                <div className="relative">
                  <img
                    src={restaurant.coverImage}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeFromFavorites(restaurant.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(restaurant.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        ({restaurant.reviewCount})
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-orange-500 text-sm font-medium mb-2">
                    {restaurant.cuisine}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {restaurant.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{restaurant.address}</span>
                      </div>
                    )}
                    
                    {restaurant.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{restaurant.phone}</span>
                      </div>
                    )}
                    
                    {restaurant.website && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4" />
                        <a 
                          href={restaurant.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="primary" size="sm" className="flex-1">
                      Order Now
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Menu
                    </Button>
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

export default CustomerFavorites;