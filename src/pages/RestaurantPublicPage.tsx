import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Globe, Clock, Heart, ShoppingBag, Plus, Minus, Eye } from 'lucide-react';
import { sdk } from '../lib/config';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

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
  allergens?: string[];
  nutritionalInfo?: any;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const RestaurantPublicPage: React.FC = () => {
  const { restaurantSlug, itemId } = useParams<{ restaurantSlug: string; itemId?: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  useEffect(() => {
    if (restaurantSlug) {
      loadRestaurantData();
      loadCartFromStorage();
    }
  }, [restaurantSlug]);

  useEffect(() => {
    if (itemId && menuItems.length > 0) {
      const item = menuItems.find(item => item.id === itemId);
      if (item) {
        setSelectedItem(item);
        setIsItemModalOpen(true);
      }
    }
  }, [itemId, menuItems]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      
      // Load restaurant
      const restaurants = await sdk.queryBuilder<Restaurant>('restaurants')
        .where(r => r.slug === restaurantSlug && r.active === true)
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

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem(`cart_${restaurantSlug}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCartToStorage = (newCart: CartItem[]) => {
    localStorage.setItem(`cart_${restaurantSlug}`, JSON.stringify(newCart));
  };

  const addToCart = (item: MenuItem) => {
    const newCart = [...cart];
    const existingItem = newCart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newCart.push({ ...item, quantity: 1 });
    }
    
    setCart(newCart);
    saveCartToStorage(newCart);
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId: string) => {
    const newCart = cart.filter(item => item.id !== itemId);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate(`/${restaurantSlug}/checkout`);
  };

  const viewItemDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
    navigate(`/${restaurantSlug}/menu/${item.id}`);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setIsItemModalOpen(false);
    navigate(`/${restaurantSlug}`);
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

  const categories = ['all', ...Object.keys(groupedMenuItems)];
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : groupedMenuItems[selectedCategory] || [];

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
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-xl font-bold text-gray-900">
              RestaurantOS
            </Link>
            <div className="flex items-center space-x-4">
              <Link to={`/${restaurantSlug}/reservations`}>
                <Button variant="outline">Make Reservation</Button>
              </Link>
              <Link to={`/${restaurantSlug}/blog`}>
                <Button variant="outline">Blog</Button>
              </Link>
              <Link to="/customer/auth">
                <Button variant="outline">Customer Login</Button>
              </Link>
              <Button
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Cart
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>
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
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'All Items' : category}
                    </button>
                  ))}
                </div>

                {/* Menu Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.id} hover>
                      <div className="flex space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                          onClick={() => viewItemDetails(item)}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 
                                className="font-semibold text-gray-900 cursor-pointer hover:text-orange-600"
                                onClick={() => viewItemDetails(item)}
                              >
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              {item.allergens && item.allergens.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.allergens.map((allergen, idx) => (
                                    <span key={idx} className="inline-flex px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                      {allergen}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-lg font-bold text-orange-500">${item.price}</span>
                          </div>
                          <div className="mt-3 flex items-center space-x-2">
                            <Button size="sm" onClick={() => addToCart(item)}>
                              Add to Cart
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => viewItemDetails(item)}
                              icon={<Eye className="w-4 h-4" />}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {restaurant.name}</h2>
                  <p className="text-gray-700 mb-4">{restaurant.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Cuisine</h3>
                      <p className="text-gray-700">{restaurant.cuisine}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Rating</h3>
                      <div className="flex items-center space-x-2">
                        {renderStars(restaurant.rating)}
                        <span className="text-gray-600">({restaurant.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>
                  <div className="text-center py-8">
                    <p className="text-gray-500">Reviews will be loaded here...</p>
                    <Button variant="outline" className="mt-4">
                      Write a Review
                    </Button>
                  </div>
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
              <Button fullWidth icon={<Heart className="w-5 h-5" />} variant="outline">
                Add to Favorites
              </Button>
              <Link to={`/${restaurantSlug}/admin`}>
                <Button fullWidth variant="outline">
                  Restaurant Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Your Order"
        size="lg"
      >
        <div className="p-6">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">${item.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-orange-500">${getCartTotal().toFixed(2)}</span>
                </div>
                <Button fullWidth size="lg" onClick={proceedToCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Item Details Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={closeItemModal}
        title={selectedItem?.name || ''}
        size="lg"
      >
        {selectedItem && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedItem.name}</h2>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                <div className="text-2xl font-bold text-orange-500 mb-4">${selectedItem.price}</div>
                
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Allergens</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.allergens.map((allergen, idx) => (
                        <span key={idx} className="inline-flex px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.nutritionalInfo && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Nutritional Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedItem.nutritionalInfo).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span>{value}{key === 'calories' ? '' : 'g'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  fullWidth 
                  size="lg" 
                  onClick={() => {
                    addToCart(selectedItem);
                    closeItemModal();
                  }}
                >
                  Add to Cart - ${selectedItem.price}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RestaurantPublicPage;