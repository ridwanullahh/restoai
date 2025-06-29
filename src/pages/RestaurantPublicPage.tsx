import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Globe, Clock, Heart, ShoppingBag } from 'lucide-react';
import { sdk } from '../lib/config';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  website: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  hours: any;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  featured: boolean;
}

const RestaurantPublicPage: React.FC = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');

  useEffect(() => {
    if (restaurantSlug) {
      loadRestaurantData();
    }
  }, [restaurantSlug]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      
      // Load restaurant
      const restaurants = await sdk.queryBuilder<Restaurant>('restaurants')
        .where(r => r.slug === restaurantSlug)
        .exec();
      
      if (restaurants.length === 0) {
        setLoading(false);
        return;
      }

      const restaurantData = restaurants[0];
      setRestaurant(restaurantData);

      // Load menu items
      const items = await sdk.queryBuilder<MenuItem>('menuItems')
        .where(item => item.restaurantId === restaurantData.id && item.available)
        .sort('category')
        .exec();
      setMenuItems(items);

    } catch (error) {
      console.error('Failed to load restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

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
          <p className="text-gray-600 mb-4">The restaurant you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Back to Home</Button>
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
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-xl font-bold text-gray-900">
              RestaurantOS
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/customer/auth">
                <Button variant="outline">Customer Login</Button>
              </Link>
              <Button>Order Now</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${restaurant.coverImage})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <h1 className="text-4xl font-bold mb-4">{restaurant.name}</h1>
            <p className="text-xl mb-4">{restaurant.description}</p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                {renderStars(restaurant.rating)}
                <span className="text-sm">({restaurant.reviewCount} reviews)</span>
              </div>
              <span className="text-orange-300 font-medium">{restaurant.cuisine}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Navigation Tabs */}
            <div className="flex space-x-8 border-b border-gray-200 mb-8">
              {['menu', 'about', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-8">
                {Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {items.map((item) => (
                        <Card key={item.id} hover>
                          <div className="flex space-x-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                </div>
                                <span className="text-lg font-bold text-orange-500">${item.price}</span>
                              </div>
                              <div className="mt-3">
                                <Button size="sm">Add to Cart</Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {restaurant.name}</h2>
                  <p className="text-gray-700">{restaurant.description}</p>
                </Card>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>
                  <p className="text-gray-500">Reviews will be loaded here...</p>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Restaurant Details */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Restaurant Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{restaurant.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{restaurant.phone}</span>
                </div>
                {restaurant.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a 
                      href={restaurant.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </Card>

            {/* Hours */}
            {restaurant.hours && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Hours</h3>
                <div className="space-y-2">
                  {Object.entries(restaurant.hours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-700">{day}</span>
                      <span className="text-gray-900">
                        {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button fullWidth icon={<ShoppingBag className="w-5 h-5" />}>
                Order Online
              </Button>
              <Button variant="outline" fullWidth icon={<Heart className="w-5 h-5" />}>
                Add to Favorites
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPublicPage;